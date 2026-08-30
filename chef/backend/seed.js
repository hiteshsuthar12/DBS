require('dotenv').config();
const mongoose = require('mongoose');
const argon2 = require('argon2');
const User = require('./src/models/User');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding');

        await User.deleteMany();
        
        const passwordHash = await argon2.hash('password123');

        await User.create([
            {
                name: 'Admin Manager',
                email: 'manager@restaurant.com',
                passwordHash,
                role: 'MANAGER'
            },
            {
                name: 'Head Chef',
                email: 'chef@restaurant.com',
                passwordHash,
                role: 'CHEF'
            }
        ]);

        console.log('Users seeded successfully! \nManager: manager@restaurant.com / password123 \nChef: chef@restaurant.com / password123');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();
