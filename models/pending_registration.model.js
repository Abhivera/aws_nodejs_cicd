module.exports = (sequelize, DataTypes) => {
  const PendingRegistration = sequelize.define('PendingRegistration', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    fullName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'full_name'
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'phone_number'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    roleId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 3, // Default to 'user' role
      field: 'role_id'
    },
    verificationToken: {
      type: DataTypes.STRING(6),
      allowNull: false,
      field: 'verification_token'
    },
    verificationExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'verification_expires_at'
    },
    verificationAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'verification_attempts'
    },
    lastVerificationAttempt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_verification_attempt'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'pending_registrations',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['verification_token'] },
      { fields: ['verification_expires_at'] },
      { fields: ['created_at'] }
    ]
  });

  // Add associations
  PendingRegistration.associate = (models) => {
    PendingRegistration.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role'
    });
  };

  return PendingRegistration;
};

