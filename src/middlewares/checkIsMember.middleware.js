async function checkIsMember(req, res, nex) {
    try {
        if (req.user.rows[0].is_superuser === false) {
            next();
        } else {
            res.json({
                success: false,
                message:
                    'Bạn không phải là thành viên nên không sử dụng được tính năng này.',
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = checkIsMember;
