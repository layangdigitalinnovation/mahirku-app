'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('thinking_styles', [
      {
        digit: 1,
        type: 'Deep Analyzer',
        code: 'Analyzer-I',
        description: 'Sangat logis, berpikir mendalam sebelum bertindak, suka sistem yang tertata.',
        theory: 'Prefrontal cortex dominan, sistematika logis',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        digit: 2,
        type: 'Social Empath',
        code: 'Empath-E',
        description: 'Ramah, peduli, hangat. Cepat membaca suasana hati orang lain dan suka menyenangkan orang lain.',
        theory: 'Ekstrovert emosional, afiliasi tinggi',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        digit: 3,
        type: 'Quiet Observer',
        code: 'Observer-I',
        description: 'Pendiam tapi teliti. Menyerap banyak informasi melalui pengamatan diam-diam, suka bekerja di belakang layar.',
        theory: 'Jungian introverted sensing',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        digit: 4,
        type: 'Active Observer',
        code: 'Observer-E',
        description: 'Detail dan cepat tanggap. Suka bergerak, langsung terjun ke lapangan, fokus pada realitas nyata.',
        theory: 'Teori fungsi sensorik ekstrovert (Carl Jung)',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        digit: 5,
        type: 'Quiet Empath',
        code: 'Empath-I',
        description: 'Emosional dalam, sangat menjaga perasaan diri & orang lain, cenderung menghindari konflik dan sensitif.',
        theory: 'Teori kecerdasan emosional intrapersonal',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        digit: 6,
        type: 'Bold Visionary',
        code: 'Visionary-E',
        description: 'Penuh ide, antusias, suka eksplorasi dan mencoba hal baru. Mudah menangkap peluang dari sekitar.',
        theory: 'Intuisi terbuka, koneksi cepat antar konsep',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        digit: 7,
        type: 'Inner Visionary',
        code: 'Visionary-I',
        description: 'Imajinatif, banyak ide, tapi lebih suka menyendiri. Berpikir jauh ke depan, cenderung filosofis.',
        theory: 'Intuisi internal, pemikiran non-linear',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        digit: 8,
        type: 'Strategic Analyzer',
        code: 'Analyzer-E',
        description: 'Cepat mengambil keputusan berdasarkan logika. Tegas, objektif, dan sangat fokus pada efisiensi.',
        theory: 'Ekstroversi logis, berpikir cepat dan sistemik',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        digit: 9,
        type: 'Dynamic Navigator',
        code: 'Navigator',
        description: 'Tipe cepat ambil keputusan. Mengandalkan feeling dan gerak refleks, biasanya kuat di lapangan atau situasi darurat.',
        theory: 'Sistem limbik dominan, insting bertahan hidup',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('thinking_styles', null, {});
  }
};