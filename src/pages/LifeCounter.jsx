import React, { useState } from 'react';

const LifeCounter = () => {
  const [players, setPlayers] = useState([
    { name: 'Player 1', lifeTotal: 20, commanderDamage: 0, poisonCounters: 0 },
    { name: 'Player 2', lifeTotal: 20, commanderDamage: 0, poisonCounters: 0 },
    { name: 'Player 3', lifeTotal: 20, commanderDamage: 0, poisonCounters: 0 },
    { name: 'Player 4', lifeTotal: 20, commanderDamage: 0, poisonCounters: 0 },
  ]);

  const handleNameChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].name = value;
    setPlayers(updatedPlayers);
  };

  const handleLifeTotalChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].lifeTotal = value;
    setPlayers(updatedPlayers);
  };

  const handleCommanderDamageChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].commanderDamage = value;
    setPlayers(updatedPlayers);
  };

  const handlePoisonCountersChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].poisonCounters = value;
    setPlayers(updatedPlayers);
  };

  return (
    <div className="life-counter">
      {players.map((player, index) => (
        <div key={index} className="player">
          <div className="player-info">
            <input
              type="text"
              value={player.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
            />
            <div>
              <label>Life Total:</label>
              <input
                type="number"
                value={player.lifeTotal}
                onChange={(e) => handleLifeTotalChange(index, parseInt(e.target.value))}
              />
            </div>
            <div>
              <label>Commander Damage:</label>
              <input
                type="number"
                value={player.commanderDamage}
                onChange={(e) => handleCommanderDamageChange(index, parseInt(e.target.value))}
              />
            </div>
            <div>
              <label>Poison Counters:</label>
              <input
                type="number"
                value={player.poisonCounters}
                onChange={(e) => handlePoisonCountersChange(index, parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LifeCounter;
