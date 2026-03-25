// ===== API CLIENT pour MongoDB =====

const API_BASE = 'http://localhost:3000/api';

// Récupérer tous les bilans
async function getAllBilans() {
  try {
    const response = await fetch(`${API_BASE}/bilans`);
    if (!response.ok) throw new Error('Erreur API');
    return await response.json();
  } catch (error) {
    console.error('Erreur getAllBilans:', error);
    return [];
  }
}

// Récupérer un bilan spécifique
async function getBilan(id) {
  try {
    const response = await fetch(`${API_BASE}/bilans/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Erreur getBilan:', error);
    return null;
  }
}

// Créer un nouveau bilan
async function createBilan(bilanData) {
  try {
    const response = await fetch(`${API_BASE}/bilans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bilanData)
    });
    if (!response.ok) throw new Error('Erreur API');
    return await response.json();
  } catch (error) {
    console.error('Erreur createBilan:', error);
    return null;
  }
}

// Mettre à jour un bilan
async function updateBilan(id, updateData) {
  try {
    const response = await fetch(`${API_BASE}/bilans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Erreur API');
    return await response.json();
  } catch (error) {
    console.error('Erreur updateBilan:', error);
    return null;
  }
}

// Supprimer un bilan
async function deleteBilan(id) {
  try {
    const response = await fetch(`${API_BASE}/bilans/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erreur API');
    return await response.json();
  } catch (error) {
    console.error('Erreur deleteBilan:', error);
    return null;
  }
}
