import { Dispatch } from 'redux'

import {
  makeActionsSet,
  makeReducers,
  makeAsyncActionCreatorSimp,
  makeActionCreator } from '../../common/utils/redux-helpers'

import * as Queries from '../queries'

import { Avatars, UID, Resource, State, Region, TimeRange, IRegion } from '../types'

import { Services } from '../../Services/Services'
import { fetchConfig, fetchResourcesByRegion } from '../../Services/DataServices'
import { setRegionSimp } from './region'

const RESOURCE = makeActionsSet('RESOURCE')
const CLEAR_NEW_ENTRY_STATE = 'CLEAR_NEW_ENTRY_STATE'
const USERS_AVATARS = makeActionsSet('USERS_AVATARS')
const JOBS = makeActionsSet('JOBS')
const CONFIGS = makeActionsSet('CONFIGS')

export const clearNewEntrState = makeActionCreator(CLEAR_NEW_ENTRY_STATE)

export const getConfigs = makeAsyncActionCreatorSimp(
  CONFIGS, () => async (dispatch: Dispatch) => {
    const resp = await fetchConfig()
    if (resp.regions.length) {
      dispatch(setRegionSimp(resp.regions[2]))
    }
    return { configs: resp }
  }
)

// export const getResources = makeAsyncActionCreatorSimp(
//   RESOURCE, () => async (dispatch: Dispatch) => {
//     const resp = await Services.graphQL.fetch<{resources: Resource[], totalCount: number}>({
//       query: Queries.AllResourcesQuery
//     })
//     dispatch(getUsersAvatars(resp.resources.reduce((acc, { UID }) => UID ? [...acc, UID] : acc , [] as UID[])))
//     return resp
//   }
// )

export const getResources = makeAsyncActionCreatorSimp(
  RESOURCE, (region: IRegion, timeRange: TimeRange) => async (dispatch: Dispatch, store: State) => {
    const resp = await fetchResourcesByRegion(region.id, timeRange.startDate, timeRange.endDate, region.timezoneSid)
    return { resources: resp }
  }
)

export const getUsersAvatars = makeAsyncActionCreatorSimp(
  USERS_AVATARS, (ids: UID[]) => async (dispatch: Dispatch, getState: () => State) => {
    if (ids.length > 0) {
      const resp = await Services.metadata._apiService.get(
        `files/avatar?user_ids=${[...new Set(ids)]}`
      )
      return resp
    }
    return {}
  }
)

export const getJobs = makeAsyncActionCreatorSimp(
  JOBS, () => async (dispatch: Dispatch) => {
    const resp = await Services.graphQL.fetch<{ jobs: object[] }>({
      query: Queries.JobsQuery
    })
    return resp
  }
)

const userAvatarsTransform = (avatars: Avatars, store: State) => {
  delete avatars.type
  return {
    avatars
  }
}

export default {
  ...makeReducers(USERS_AVATARS, { transform: userAvatarsTransform }),
  ...makeReducers(RESOURCE, { dataField: 'resources' }),
  ...makeReducers(JOBS, { dataField: 'jobs' }),
  ...makeReducers(CONFIGS, { dataField: 'configs' })
}
