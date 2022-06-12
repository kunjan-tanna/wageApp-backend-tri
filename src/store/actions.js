export const startLoader = () => ({
    type: 'START_LOADER',
})

export const stopLoader = () => ({
    type: 'STOP_LOADER',
})

export const setAdminData = (data) => ({
    type: 'SET_ADMIN',
    admin: data
})