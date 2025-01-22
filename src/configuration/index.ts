export default () => (
    {
        secret_jwt: process.env.SECRET_JWT,
        expireJwt: process.env.JWT_EXPIRE,
        days: process.env.DAYS
    }
)