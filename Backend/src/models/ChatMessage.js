import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
    {
        // Conversación key — para clientes es su propio _id; para staff-to-staff es el menor _id primero
        conversationId: { type: String, required: true, index: true },
        de: {
            id:     { type: String, required: true },
            nombre: { type: String, required: true },
            rol:    { type: String, required: true },
        },
        texto: { type: String, required: true, maxlength: 4000 },
        visto: { type: Boolean, default: false },
    },
    { timestamps: true }
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
