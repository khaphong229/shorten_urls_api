async function checkIsAdmin(req, res, next) {
    try {
        const isAdmin = req.user.rows[0].is_superuser;
        if (isAdmin !== true) {
            return res.status(400).json({
                success: false,
                message: 'Bạn không có quyền làm việc này',
            });
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = checkIsAdmin;
