# 🔧 Corrections API Backend - Sondages

## ❌ **Problème 1 : API retourne null au lieu d'un tableau vide**

### **Correction dans `Survey/views.py` :**

```python
@api.route('/surveys')
class SurveyList(Resource):
    @jwt_required()
    @api.marshal_with(surveys_response_model)
    def get(self):
        try:
            # Récupération sécurisée des sondages actifs
            surveys = MyWittiSurvey.query.filter_by(is_active=True).all()
            
            # ✅ CORRECTION : Retourner un tableau vide au lieu de null
            surveys_data = [{
                'id': survey.id,
                'title': survey.title or "Sans titre",
                'description': survey.description or "Aucune description",
                'is_active': survey.is_active,
                'created_at': survey.created_at.strftime('%Y-%m-%d %H:%M:%S') if survey.created_at else "Unknown",
                'questions': [],  # ✅ Ajouter les questions
                'responses': 0    # ✅ Ajouter le compteur de réponses
            } for survey in surveys]
            
            return {
                'msg': 'Sondages récupérés avec succès',
                'surveys': surveys_data  # ✅ Toujours retourner un tableau
            }, 200
        except Exception as e:
            current_app.logger.error(f"Error fetching surveys: {str(e)}")
            # ✅ CORRECTION : Retourner un tableau vide en cas d'erreur
            return {
                'msg': 'Erreur lors de la récupération',
                'surveys': []
            }, 500
```

## ❌ **Problème 2 : Endpoint admin manquant**

### **Ajouter l'endpoint admin dans `Survey/views.py` :**

```python
@api.route('/admin/surveys')
class AdminSurveyList(Resource):
    @jwt_required()
    def get(self):
        try:
            # Récupérer tous les sondages (pas seulement actifs)
            surveys = MyWittiSurvey.query.all()
            surveys_data = [{
                'id': survey.id,
                'title': survey.title or "Sans titre",
                'description': survey.description or "Aucune description",
                'is_active': survey.is_active,
                'created_at': survey.created_at.strftime('%Y-%m-%d %H:%M:%S') if survey.created_at else "Unknown",
                'questions': [],  # À implémenter
                'responses': 0    # À implémenter
            } for survey in surveys]
            
            return surveys_data, 200
        except Exception as e:
            current_app.logger.error(f"Error fetching admin surveys: {str(e)}")
            return [], 500

    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            
            # Créer le sondage
            survey = MyWittiSurvey(
                title=data.get('title'),
                description=data.get('description'),
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            db.session.add(survey)
            db.session.commit()
            
            # Créer les questions (choix multiple uniquement)
            questions = data.get('questions', [])
            for question_data in questions:
                question = MyWittiSurveyOption(
                    survey_id=survey.id,
                    option_text=question_data.get('text'),
                    option_value=question_data.get('id', 1)
                )
                db.session.add(question)
            
            db.session.commit()
            
            return {
                'id': survey.id,
                'title': survey.title,
                'description': survey.description,
                'is_active': survey.is_active,
                'created_at': survey.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'questions': questions,
                'responses': 0
            }, 201
            
        except Exception as e:
            current_app.logger.error(f"Error creating survey: {str(e)}")
            db.session.rollback()
            return {"error": "Internal server error"}, 500
```

## ❌ **Problème 3 : Endpoints manquants**

### **Ajouter les endpoints manquants :**

```python
@api.route('/admin/surveys/<int:survey_id>')
class AdminSurveyDetail(Resource):
    @jwt_required()
    def put(self, survey_id):
        try:
            survey = MyWittiSurvey.query.get_or_404(survey_id)
            data = request.get_json()
            
            survey.title = data.get('title', survey.title)
            survey.description = data.get('description', survey.description)
            
            # Mettre à jour les questions
            questions = data.get('questions', [])
            
            # Supprimer les anciennes questions
            MyWittiSurveyOption.query.filter_by(survey_id=survey_id).delete()
            
            # Ajouter les nouvelles questions
            for question_data in questions:
                question = MyWittiSurveyOption(
                    survey_id=survey.id,
                    option_text=question_data.get('text'),
                    option_value=question_data.get('id', 1)
                )
                db.session.add(question)
            
            db.session.commit()
            
            return {"message": "Sondage mis à jour"}, 200
            
        except Exception as e:
            current_app.logger.error(f"Error updating survey: {str(e)}")
            db.session.rollback()
            return {"error": "Internal server error"}, 500

    @jwt_required()
    def delete(self, survey_id):
        try:
            survey = MyWittiSurvey.query.get_or_404(survey_id)
            
            # Supprimer les réponses
            MyWittiSurveyResponse.query.filter_by(survey_id=survey_id).delete()
            
            # Supprimer les options
            MyWittiSurveyOption.query.filter_by(survey_id=survey_id).delete()
            
            # Supprimer le sondage
            db.session.delete(survey)
            db.session.commit()
            
            return {"message": "Sondage supprimé"}, 200
            
        except Exception as e:
            current_app.logger.error(f"Error deleting survey: {str(e)}")
            db.session.rollback()
            return {"error": "Internal server error"}, 500

@api.route('/admin/surveys/<int:survey_id>/responses')
class AdminSurveyResponses(Resource):
    @jwt_required()
    def get(self, survey_id):
        try:
            responses = MyWittiSurveyResponse.query.filter_by(survey_id=survey_id).all()
            responses_data = [{
                'id': response.id,
                'survey_id': response.survey_id,
                'user_id': response.user_id,
                'option_id': response.option_id,
                'submitted_at': response.submitted_at.strftime('%Y-%m-%d %H:%M:%S') if response.submitted_at else "Unknown"
            } for response in responses]
            
            return responses_data, 200
            
        except Exception as e:
            current_app.logger.error(f"Error fetching survey responses: {str(e)}")
            return [], 500
```

## ✅ **Structure de données attendue :**

### **Frontend envoie :**
```json
{
  "title": "Mon sondage",
  "description": "Description du sondage",
  "questions": [
    {
      "id": 1,
      "text": "Question 1",
      "type": "multiple_choice",
      "required": true
    }
  ]
}
```

### **Backend retourne :**
```json
{
  "id": 1,
  "title": "Mon sondage",
  "description": "Description du sondage",
  "is_active": true,
  "created_at": "2024-01-01 12:00:00",
  "questions": [
    {
      "id": 1,
      "text": "Question 1",
      "type": "multiple_choice",
      "required": true
    }
  ],
  "responses": 0
}
``` 