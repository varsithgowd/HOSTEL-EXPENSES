export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map((issue) => {
        const path = issue.path.slice(1).join('.');
        return `${path ? path + ': ' : ''}${issue.message}`;
      });

      return res.status(400).json({
        success: false,
        message: errorMessages.join('; '),
        errors: parsed.error.issues,
      });
    }

    req.validated = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
};

