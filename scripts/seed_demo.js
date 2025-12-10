const { db, initDb } = require('../server/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

console.log('Seeding Database (Phase 2)...');
initDb();

async function seed() {
    // 1. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);

    let alice, bob;
    try {
        alice = db.createUser({
            id: uuidv4(),
            email: 'alice@example.com',
            password_hash: passwordHash,
            name: 'Alice Producer'
        });
        console.log('Created User: Alice (alice@example.com) / password123');
    } catch (e) {
        alice = db.findUserByEmail('alice@example.com');
    }

    try {
        bob = db.createUser({
            id: uuidv4(),
            email: 'bob@example.com',
            password_hash: passwordHash,
            name: 'Bob Collaborator'
        });
        console.log('Created User: Bob (bob@example.com) / password123');
    } catch (e) {
        bob = db.findUserByEmail('bob@example.com');
    }

    // 2. Create Project (Owned by Alice)
    const projectId = uuidv4();
    db.createProject({
        id: projectId,
        name: 'Top Secret Album',
        description: 'This is the big one. Confidential.',
        bpm: 140,
        musical_key: 'D Min',
        owner_email: alice.email,
        collaborators: [bob.email] // Bob is invited
    });
    console.log(`Created Project: Top Secret Album (Owner: Alice, Collab: Bob)`);

    // 3. Create Snapshot
    const snapId1 = uuidv4();
    db.createSnapshot({
        id: snapId1,
        project_id: projectId,
        parent_id: null,
        message: 'Initial Idea',
        file_tree: { "demo.mp3": { hash: "123", size: 100 } },
        author: alice.email,
        external_link: "https://dropbox.com/link-to-zip"
    });
    console.log(`Created Snapshot.`);

    console.log('Done! Login with alice@example.com or bob@example.com (pass: password123)');
}

seed();
