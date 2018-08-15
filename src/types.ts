
import * as firebase from 'firebase'


type Query = firebase.firestore.Query
type QuerySnapshot = firebase.firestore.QuerySnapshot
type GetOptions = firebase.firestore.GetOptions
type Firestore = firebase.firestore.Firestore
type QueryListenOptions = firebase.firestore.QueryListenOptions
type DocumentListenOptions = firebase.firestore.DocumentListenOptions
type DocumentReference = firebase.firestore.DocumentReference
type CollectionReference = firebase.firestore.CollectionReference


export type FieryData = { [prop: string]: any }

export type FieryMap = { [key: string]: FieryData }

export type FieryTarget = FieryData[] | FieryData | FieryMap

export type FieryExclusions = { [field: string]: boolean }

export type FieryInstanceFactory = (source: FierySource, options?: Partial<FieryOptions>) => FieryTarget

export type FieryFactory = (vm: FieryVue, options: FieryOptions) => FieryTarget

export type FierySource = Query | DocumentReference | CollectionReference

export type FierySources = { [property: string]: FierySource }


export interface FieryVue
{
  $fiery: FieryInstance

  $fires: FierySources

  [prop: string]: any

  $emit: (event: string, eventObject?: any) => void
}

export interface FieryOptions
{

  id: number

  property?: string

  key?: string

  query?: (source: FierySource) => FierySource

  map?: boolean

  once?: boolean

  reset?: boolean

  type?: { new (): FieryData }

  record?: boolean

  recordOptions: {
    set?: string
    update?: string,
    remove?: string,
    ref?: string
  }

  propValue: string

  onceOptions?: GetOptions

  liveOptions: QueryListenOptions | DocumentListenOptions

  exclude: FieryExclusions | string[]

  include: string[]

  onError: (error: any) => any

  onSuccess: (target: FieryTarget) => any

  onMissing: () => any

  onRemove: () => any

  parent?: FieryOptions

  sub?: {
    [subProp: string]: FieryOptions
  }

}

export interface FieryEntry
{

  options: FieryOptions

  source: FierySource

  target: FieryTarget

  promise?: Promise<QuerySnapshot>

  off?: () => any

  id?: number

  index?: number

}

export interface FieryInstance
{

  (source: FierySource, options?: Partial<FieryOptions>): FieryTarget

  storeKeyNext: number

  storeIdToKey: {
    [id: string]: number
  }

  stores: {
    [storeKey: string]: Firestore
  }

  options: {
    [optionKey: number]: FieryOptions
  }

  optionKeyNext: number

  entry: {
    [entryKey: string]: FieryEntry
  }

  entryList: (FieryEntry | null)[]

  update: (data: FieryData, fields?: string[]) => Promise<void> | undefined

  set: (data: FieryData, fields?: string[]) => Promise<void> | undefined

  remove: (data: FieryData) => Promise<void> | undefined

  ref: (data: FieryData) => FierySource | undefined

  getMetadata: (data: FieryData) => FieryMetadata

}

export interface FieryMetadata
{

  uid: string

  path: string

  storeKey: string

  store: Firestore

  optionKey: string

  options: FieryOptions

}
