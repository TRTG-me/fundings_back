const SELECT_FIELDS = {
    id: true,
    email: true,
    name: true,
    wallet: true
}


export const USER_SELECT_FIELDS = {
    ...SELECT_FIELDS,
}

export const APP_USER_FIELDS = {
    ...SELECT_FIELDS,
    password: true
}