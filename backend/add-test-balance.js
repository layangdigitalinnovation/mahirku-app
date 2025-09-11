require('dotenv').config();
const { Sequelize } = require('sequelize');

// Create sequelize instance directly
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

// Define models inline for this script
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

const AffiliateBalance = sequelize.define('AffiliateBalance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  affiliateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  totalEarned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  availableBalance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  withdrawnAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  minimumBalance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100000,
  },
}, {
  tableName: 'affiliate_balances',
  timestamps: true,
});

// Define associations
AffiliateBalance.belongsTo(User, { foreignKey: 'affiliateId', as: 'affiliate' });
User.hasOne(AffiliateBalance, { foreignKey: 'affiliateId', as: 'affiliateBalance' });

async function addTestBalance() {
  try {
    console.log('=== Adding Test Balance to Affiliator ===\n');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected');
    
    // Find the test affiliator
    const affiliator = await User.findOne({
      where: { email: 'aff9@example.com' }
    });
    
    if (!affiliator) {
      console.log('❌ Test affiliator not found');
      return;
    }
    
    console.log(`✓ Found affiliator: ${affiliator.fullname} (${affiliator.email})`);
    
    // Check existing balance
    let balance = await AffiliateBalance.findOne({
      where: { affiliateId: affiliator.id }
    });
    
    if (!balance) {
      // Create new balance
      balance = await AffiliateBalance.create({
        affiliateId: affiliator.id,
        totalEarned: 500000, // 500,000 rupiah
        availableBalance: 400000, // 400,000 available (500k - 100k minimum)
        withdrawnAmount: 0,
        minimumBalance: 100000
      });
      console.log('✓ Created new affiliate balance');
    } else {
      // Update existing balance
      balance.totalEarned = 500000;
      balance.availableBalance = 400000;
      balance.withdrawnAmount = 0;
      balance.minimumBalance = 100000;
      await balance.save();
      console.log('✓ Updated existing affiliate balance');
    }
    
    console.log(`Balance details:`);
    console.log(`  Total Earned: Rp ${balance.totalEarned.toLocaleString()}`);
    console.log(`  Available Balance: Rp ${balance.availableBalance.toLocaleString()}`);
    console.log(`  Withdrawn Amount: Rp ${balance.withdrawnAmount.toLocaleString()}`);
    console.log(`  Minimum Balance: Rp ${balance.minimumBalance.toLocaleString()}`);
    
    console.log('\n✅ Test balance added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding test balance:', error);
  } finally {
    await sequelize.close();
    console.log('✓ Database connection closed');
  }
}

addTestBalance();