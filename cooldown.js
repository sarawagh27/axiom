const cooldowns = new Map();

function isOnCooldown(userId, cooldownMs) {
  const last = cooldowns.get(userId);
  return last && Date.now() - last < cooldownMs;
}

function setCooldown(userId) {
  cooldowns.set(userId, Date.now());
}

module.exports = { isOnCooldown, setCooldown };
