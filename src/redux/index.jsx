import { combineReducers } from 'redux'
import app from './reducers/app.jsx'

const todoApp = combineReducers({
  app
})

export default todoApp