// LifeCounter.js
import React, { useState } from 'react';
import './LifeCounter.css';

const LifeCounter = () => {

  //Image displayed when a user's life total hits 0
  const skullImage = 'https://images.wallpapersden.com/image/download/golden-skull_bGVtaWmUmZqaraWkpJRobWllrWdma2U.jpg';

  const [players, setPlayers] = useState([
    { name: 'Player 1', lifeTotal: 20, commanderDamage: 0, poisonCounters: 0, removed: false },
    { name: 'Player 2', lifeTotal: 20, commanderDamage: 0, poisonCounters: 0, removed: false },
    { name: 'Player 3', lifeTotal: 20, commanderDamage: 0, poisonCounters: 0, removed: false },
    { name: 'Player 4', lifeTotal: 20, commanderDamage: 0, poisonCounters: 0, removed: false },
  ]);

  //Changes to life total
  const handleLifeTotalChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].lifeTotal = value;
    if (value <= 0) {
      updatedPlayers[index].removed = true;
    }
    setPlayers(updatedPlayers);
  };

  //Changes to commander damage
  const handleCommanderDamageChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].commanderDamage = value;
    setPlayers(updatedPlayers);
  };

  //Changes to poison counters
  const handlePoisonCountersChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].poisonCounters = value;
    if (value >= 10) {
      updatedPlayers[index].removed = true;
    }
    setPlayers(updatedPlayers);
  };

  return (
    <div className="life-counter">
      {players.map((player, index) => (
        <div key={index} className={`player ${player.removed ? 'removed' : ''} ${player.rotate ? 'rotate' : ''}`}>
          <div className="player-info">
            <div className="player-name">{player.name}</div>
            <div className="life-total">{player.lifeTotal}</div>
            <div className="counters">
              <button onClick={() => handleLifeTotalChange(index, player.lifeTotal - 1)}>-</button>
              <button onClick={() => handleLifeTotalChange(index, player.lifeTotal + 1)}>+</button>
            </div>
            <div className="stats">
              <div>
                <label>Commander Damage:</label>
                <button onClick={() => handleCommanderDamageChange(index, player.commanderDamage - 1)}>-</button>
                <span>{player.commanderDamage}</span>
                <button onClick={() => handleCommanderDamageChange(index, player.commanderDamage + 1)}>+</button>
              </div>
              <div>
                <label>Poison Counters:</label>
                <button onClick={() => handlePoisonCountersChange(index, player.poisonCounters - 1)}>-</button>
                <span>{player.poisonCounters}</span>
                <button onClick={() => handlePoisonCountersChange(index, player.poisonCounters + 1)}>+</button>
              </div>
            </div>
          </div>
          {player.removed && <img className="skull" src={skullImage} alt="Skull" />}
        </div>
      ))}
    </div>
  );
};

export default LifeCounter;