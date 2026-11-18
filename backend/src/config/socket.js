// ═══════════════════════════════════════════════════════════
// SINGLETON SOCKET.IO
// ═══════════════════════════════════════════════════════════

let io = null;

exports.setIO = (ioInstance) => {
  io = ioInstance;
  console.log('✅ Socket.IO enregistré dans le singleton');
};

exports.getIO = () => {
  if (!io) {
    console.warn('⚠️  Socket.IO non initialisé (getIO appelé trop tôt ?)');
  }
  return io;
};