export let lastMessageTime = null;
export let lastTTNTimestamp = null;

export function updateLastMessageTime() {
    lastMessageTime = new Date();
}

export function updateLastTTNTimestamp(timestamp) {
    lastTTNTimestamp = timestamp;
}