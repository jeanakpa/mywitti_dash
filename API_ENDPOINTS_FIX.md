# 🔧 Correction de l'erreur "Failed to fetch" - Sondages

## ❌ **Problème actuel**
L'erreur "Failed to fetch" se produit car les endpoints suivants n'existent pas sur votre backend :

```
PATCH /admin/surveys/:id/publish
```

## ✅ **Solutions proposées**

### **Option 1 : Utiliser PUT au lieu de PATCH (Recommandée)**

Modifiez les fonctions dans `src/pages/SurveyManagement.jsx` :

```javascript
// ❌ ANCIEN CODE (ne fonctionne pas)
const handlePublish = async (survey) => {
  await apiFetch(`/admin/surveys/${survey.id}/publish`, { 
    method: 'PATCH', 
    token, 
    body: { isPublished: true } 
  });
};

// ✅ NOUVEAU CODE (utilise PUT)
const handlePublish = async (survey) => {
  await apiFetch(`/admin/surveys/${survey.id}`, { 
    method: 'PUT', 
    token, 
    body: { ...survey, isPublished: true, publishedAt: new Date().toISOString() } 
  });
};

const handleUnpublish = async (survey) => {
  await apiFetch(`/admin/surveys/${survey.id}`, { 
    method: 'PUT', 
    token, 
    body: { ...survey, isPublished: false, publishedAt: null } 
  });
};
```

### **Option 2 : Créer l'endpoint PATCH sur votre backend**

Si vous préférez garder PATCH, créez cet endpoint sur votre backend :

```javascript
// Backend - Express.js
app.patch('/admin/surveys/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    
    const survey = await Survey.findByIdAndUpdate(id, {
      isPublished,
      publishedAt: isPublished ? new Date() : null
    });
    
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🎯 **Endpoints nécessaires sur votre backend**

### **Endpoints principaux :**
1. `GET /admin/surveys` - Récupérer tous les sondages
2. `POST /admin/surveys` - Créer un sondage
3. `PUT /admin/surveys/:id` - Modifier un sondage
4. `DELETE /admin/surveys/:id` - Supprimer un sondage
5. `GET /admin/surveys/:id/responses` - Récupérer les réponses

### **Endpoints clients :**
6. `GET /surveys/published` - Récupérer les sondages publiés
7. `POST /surveys/:id/responses` - Soumettre une réponse

## 🚀 **Test rapide**

Pour tester si votre backend répond, essayez :

```bash
curl -X GET http://localhost:5000/admin/surveys
```

Si vous obtenez une erreur 404, cela confirme que l'endpoint n'existe pas encore. 