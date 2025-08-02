const { createOKResponse, createErrorResponse } = require('#factories/responses/api');
const clientFacade = require('#facades/client');
const { body, param, validationResult } = require('express-validator');

module.exports = function ClientController() {
  const validateProfileUpdate = [
    param('clientId').isInt().withMessage('clientId must be an integer'),
    body('firstName').optional().isString().isLength({ min: 2 }),
    body('lastName').optional().isString().isLength({ min: 2 }),
    body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone format'),
    body('bio').optional().isString(),
  ];

  const validateProgress = [
    param('clientId').isInt().withMessage('clientId must be an integer'),
    body('metric').isString().notEmpty().withMessage('Metric is required'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
    body('notes').optional().isString(),
  ];

  const validateAchievement = [
    param('clientId').isInt().withMessage('clientId must be an integer'),
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
  ];

  const _getDashboard = async (req, res) => {
    try {
      const clientId = req.token.id;
      const dashboard = await clientFacade.getClientDashboard({ clientId });
      return createOKResponse({ res, content: { dashboard } });
    } catch (error) {
      return createErrorResponse({ res, error, status: error.status || 500 });
    }
  };

  const _updateProfile = async (req, res) => {
    try {
      await validateProfileUpdate.map((check) => check.run(req));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(errors.array()[0].msg, { cause: { status: 400 } });
      }
      const coachId = req.token.id;
      const clientId = parseInt(req.params.clientId);
      const updates = req.body;
      const client = await clientFacade.updateClientProfile({ coachId, clientId, updates });
      return createOKResponse({ res, content: { client } });
    } catch (error) {
      return createErrorResponse({ res, error, status: error.cause?.status || 500 });
    }
  };

  const _addProgress = async (req, res) => {
  try {
    await validateProgress.map((check) => check.run(req));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg, { cause: { status: 400 } });
    }
    const coachId = req.token.id;
    const clientId = parseInt(req.params.clientId);
    const { metric, value, notes } = req.body;
    const client = await User.findByPk(clientId);
    if (!client) throw new Error('Client not found', { cause: { status: 404 } });
    const coachClient = await CoachClient.findOne({ where: { coachId, clientId } });
    if (!coachClient) throw new Error('Unauthorized: Not your client', { cause: { status: 403 } });
    const progress = await Progress.create({ clientId, metric, value, notes });
    // Логика начисления коинов (например, 10 коинов за новый прогресс)
    client.coins += 10;
    await client.save();
    return createOKResponse({ res, content: { progress, coins: client.coins } });
  } catch (error) {
    return createErrorResponse({ res, error, status: error.cause?.status || 500 });
  }
};

const _addAchievement = async (req, res) => {
  try {
    await validateAchievement.map((check) => check.run(req));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg, { cause: { status: 400 } });
    }
    const coachId = req.token.id;
    const clientId = parseInt(req.params.clientId);
    const { title, description } = req.body;
    const client = await User.findByPk(clientId);
    if (!client) throw new Error('Client not found', { cause: { status: 404 } });
    const coachClient = await CoachClient.findOne({ where: { coachId, clientId } });
    if (!coachClient) throw new Error('Unauthorized: Not your client', { cause: { status: 403 } });
    const achievement = await Achievement.create({ clientId, title, description });
    // Логика начисления коинов (например, 20 коинов за ачивку)
    client.coins += 20;
    await client.save();
    return createOKResponse({ res, content: { achievement, coins: client.coins } });
  } catch (error) {
    return createErrorResponse({ res, error, status: error.cause?.status || 500 });
  }
};

  return {
    getDashboard: _getDashboard,
    updateProfile: _updateProfile,
    addProgress: _addProgress,
    addAchievement: _addAchievement,
  };
};
