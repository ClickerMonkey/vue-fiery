
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

export type FieryEntryMap = { [key: string]: FieryEntry }

export type FieryChangesCallback = (changes: boolean, remote: FieryData, local: FieryData) => any

export type FieryEquality = (a: any, b: any) => boolean



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

  newDocument: (encoded?: FieryData) => FieryData

  newCollection: () => FieryMap | FieryData[]

  decode?: (encoded: FieryData) => FieryData

  decoders?:
  {
    [prop: string]: (a: any, encoded: FieryData) => any
  },

  encoders?:
  {
    [prop: string]: (a: any, data: FieryData) => any
  },

  record?: boolean

  recordOptions:
  {
    sync?: string
    update?: string
    remove?: string
    ref?: string
    clear?: string
    getChanges?: string
    [unspecified: string]: any
  }

  recordFunctions:
  {
    sync: (fields?: string[]) => any
    update: (fields?: string[]) => any
    remove: (excludeSubs: boolean) => any
    ref: (sub?: string) => any
    clear: (props: string | string[]) => any
    getChanges: (fieldsOrCallback: string[] | FieryChangesCallback,
      callbackOrEquality?: FieryChangesCallback | FieryEquality,
      equalityOrNothing?: FieryEquality) => any
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

  sub?:
  {
    [subProp: string]: FieryOptions
  }

}

export interface FieryEntry
{

  options: FieryOptions

  source: FierySource

  target: FieryTarget

  children: FieryEntryMap

  promise?: Promise<QuerySnapshot>

  off?: () => any

  id?: number

  index?: number

}

export interface FieryInstance
{

  (source: FierySource, options?: Partial<FieryOptions>): FieryTarget

  storeKeyNext: number

  stores:
  {
    [storeKey: number]: Firestore
  }

  storeIdToKey:
  {
    [id: string]: number
  }

  optionKeyNext: number

  options:
  {
    [optionKey: number]: FieryOptions
  }

  entry: FieryEntryMap

  entryList: (FieryEntry | null)[]

  update: (data: FieryData, fields?: string[]) => Promise<void> | undefined

  sync: (data: FieryData, fields?: string[]) => Promise<void> | undefined

  remove: (data: FieryData) => Promise<void> | undefined

  clear: (data: FieryData, props: string | string[]) => Promise<void> | undefined

  getChanges: (data: FieryData,
    fieldsOrCallback: string[] | FieryChangesCallback,
    callbackOrEquality?: FieryChangesCallback | FieryEquality,
    equalityOrNothing?: FieryEquality) => Promise<void> | undefined

  ref: (data: FieryData) => FierySource | undefined

  getMetadata: (data: FieryData) => FieryMetadata

  link: () => void

  destroy: () => void
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
