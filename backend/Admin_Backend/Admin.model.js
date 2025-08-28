
import mongoose from 'mongoose';

const AdminSchema  = new mongoose.Schema({
    username:
    {
        type: String,
        default : 'admin',
        unique: true,
        required: true
    },
    password: {
        type: String,
        default: 'admin123',
        unique: true,
        required: true
    },

    // username: 'admin',
    // password: 'admin123',
});

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;