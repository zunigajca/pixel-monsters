export const ENVIRONMENTS = {
  CLEAR: {
    name: 'Clear Skies',
    description: 'Perfect visibility. Ideal for a clean fight.',
    style: { background: '#151518', borderColor: '#222' }
  },
  FOG: {
    name: 'Dense Fog',
    description: 'Visibility drops heavily. All combatants have a 33% chance to miss attacks.',
    style: { background: 'linear-gradient(135deg, #2c3e50, #0f172a)', borderColor: '#9ca3af' }
  },
  RAIN: {
    name: 'Acid Rain',
    description: 'A toxic downpour corrodes the field. Every active monster takes 3 direct HP damage at the end of their turn.',
    style: { background: 'linear-gradient(135deg, #1e293b, #14532d)', borderColor: '#a3e635' }
  }
};