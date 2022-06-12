const initialState = {
  loading: false,
  redirect_to_login: false,
  admin: {}
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_REDRECT_TO_LOGIN_TRUE':
      return {
        ...state,
        redirect_to_login: true
      }
    case 'SET_REDRECT_TO_LOGIN_FALSE':
      return {
        ...state,
        redirect_to_login: false
      }
    case 'START_LOADER':
      return {
        ...state,
        loading: true,
      }
    case 'STOP_LOADER':
      return {
        ...state,
        loading: false,
      }
    case 'SET_ADMIN':
      return {
        ...state,
        admin: action.admin,
      }
    default:
      return state
  }
}

export default reducer