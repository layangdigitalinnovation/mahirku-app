module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Insert 40 DISC questions (40 questions / 4 per group = 10 groups of 4)
        const questions = [];
        for (let i = 1; i <= 40; i++) {
            questions.push({
                question_order: i,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        await queryInterface.bulkInsert('disc_questions', questions, {});

        // Get the inserted question IDs
        const insertedQuestions = await queryInterface.sequelize.query(
            'SELECT id, question_order FROM disc_questions ORDER BY question_order ASC',
            { type: Sequelize.QueryTypes.SELECT }
        );

        // DISC trait words - professionally curated
        const discTraits = {
            D: [
                'Tegas', 'Berani', 'Kompetitif', 'Langsung', 'Menantang',
                'Kuat', 'Menentukan', 'Memimpin', 'Tuntutan', 'Ambisius',
                'Percaya Diri', 'Dominan', 'Asertif', 'Berorientasi Hasil', 'Mandiri',
                'Mendesak', 'Menguasai', 'Blak-blakan', 'Keras', 'Gesit',
                'Penentu', 'Cepat', 'Terus Terang', 'Pemberani', 'Dinamis',
                'Fokus', 'Efisien', 'Praktis', 'Produktif', 'Tangguh',
                'Gigih', 'Pasti', 'Kritis', 'Aktif', 'Strategis',
                'Progresif', 'Tegar', 'Intensif', 'Penuh Energi', 'Berpengaruh'
            ],
            I: [
                'Antusias', 'Ramah', 'Optimis', 'Persuasif', 'Ekspresif',
                'Menarik', 'Komunikatif', 'Menginspirasi', 'Hangat', 'Ceria',
                'Meyakinkan', 'Bersosialisasi', 'Percaya', 'Spontan', 'Bersemangat',
                'Menyenangkan', 'Terbuka', 'Populer', 'Humoris', 'Kreatif',
                'Impulsif', 'Emosional', 'Menghibur', 'Penuh Gairah', 'Lincah',
                'Menghidupkan', 'Mempesona', 'Berinteraksi', 'Penuh Kehangatan', 'Ramah Tamah',
                'Berpengaruh Positif', 'Atraktif', 'Menggerakkan', 'Enerjik', 'Menarik Perhatian',
                'Berani Bicara', 'Suka Berkumpul', 'Memotivasi', 'Mudah Bergaul', 'Menyemangati'
            ],
            S: [
                'Sabar', 'Tenang', 'Stabil', 'Mendukung', 'Akomodatif',
                'Konsisten', 'Dapat Diandalkan', 'Rendah Hati', 'Lembut', 'Kooperatif',
                'Setia', 'Pendengar Baik', 'Harmonis', 'Penyabar', 'Pembantu',
                'Perhatian', 'Pengertian', 'Toleran', 'Merawat', 'Bertanggung Jawab',
                'Tenang Hati', 'Penurut', 'Penuh Kasih', 'Persahabatan', 'Pemaaf',
                'Lembut Hati', 'Bijaksana', 'Mengayomi', 'Damai', 'Penuh Empati',
                'Bersahabat', 'Memperhatikan', 'Dapat Dipercaya', 'Penuh Kedamaian', 'Stabil Emosi',
                'Suportif', 'Penenang', 'Pengertian Orang', 'Selalu Hadir', 'Menenangkan'
            ],
            C: [
                'Analitis', 'Teliti', 'Hati-hati', 'Sistematis', 'Detail',
                'Logis', 'Waspada', 'Akurat', 'Tertutup', 'Diplomatis',
                'Teratur', 'Perfeksionis', 'Metodis', 'Presisi', 'Kritis',
                'Fakta', 'Terencana', 'Objektif', 'Konservatif', 'Reflektif',
                'Berpikir Kritis', 'Terstruktur', 'Terkendali', 'Rasional', 'Cermat',
                'Menyelidiki', 'Questioner', 'Skeptis', 'Berhitung', 'Tertib',
                'Eksak', 'Prosedural', 'Profesional', 'Realistis', 'Serius',
                'Fokus Detail', 'Berbasis Data', 'Evaluatif', 'Tekun', 'Berpikir Dalam'
            ]
        };

        // Insert options for each question with proper trait words
        const options = [];

        for (let i = 0; i < insertedQuestions.length; i++) {
            const question = insertedQuestions[i];
            const index = i % 40; // Cycle through traits

            options.push(
                {
                    question_id: question.id,
                    text: discTraits.D[index],
                    value: 'D',
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    question_id: question.id,
                    text: discTraits.I[index],
                    value: 'I',
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    question_id: question.id,
                    text: discTraits.S[index],
                    value: 'S',
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    question_id: question.id,
                    text: discTraits.C[index],
                    value: 'C',
                    created_at: new Date(),
                    updated_at: new Date()
                }
            );
        }

        await queryInterface.bulkInsert('disc_options', options, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('disc_options', null, {});
        await queryInterface.bulkDelete('disc_questions', null, {});
    }
};
