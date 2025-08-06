import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: [1, 'La cantidad no puede ser menor que 1.'],
        default: 1
    },
}, { _id: false });

const carritoSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true,
        unique: true
    },
    items: [itemSchema],
}, { timestamps: true });

const Carrito = mongoose.model("Carrito", carritoSchema);
export default Carrito;