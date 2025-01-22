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

export const DATA = [
    { fundingRate: '1' },
    { fundingRate: '2' },
    { fundingRate: '3' },
    { fundingRate: '4' },
    { fundingRate: '5' },
    { fundingRate: '6' },
    { fundingRate: '7' },
    { fundingRate: '8' },
    { fundingRate: '9' },
    { fundingRate: '10' },
];