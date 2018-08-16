
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

export type FieryInstanceFactory = (source: FierySource, options?: string | Partial<FieryOptions>) => FieryTarget

export type FieryFactory = (vm: FieryVue, options: FieryOptions) => FieryTarget

export type FierySource = Query | DocumentReference | CollectionReference

export type FierySources = { [property: string]: FierySource }

export type FieryEntryMap = { [key: string]: FieryEntry }

export type FieryChangesCallback = (changes: boolean, remote: FieryData, local: FieryData) => any

export type FieryEquality = (a: any, b: any) => boolean

export type FieryMergeStrategy = (a: any, b: any) => any

export type FieryMergeStrategies = { [option: string]: FieryMergeStrategy }

export type FieryOptionsMap = { [name: string]: Partial<FieryOptions> }

export type FieryFields = string | string[]


export interface FieryVue
{
  $fiery: FieryInstance

  $fires: FierySources

  // Vue properties & functions

  [prop: string]: any

  $emit: (event: string, eventObject?: any) => void

  $delete: (object: any, key: string | number) => any

  $set: (object: any, key: string | number, value?: any) => any
}

export interface FieryOptions
{

  extends?: string | Partial<FieryOptions>

  id: number

  shared: boolean

  vm?: FieryVue

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

  recordFunctions:
  {
    sync: (fields?: FieryFields) => any
    update: (fields?: FieryFields) => any
    remove: (excludeSubs: boolean) => any
    ref: (sub?: string) => any
    clear: (props: FieryFields) => any
    getChanges: (fieldsOrCallback: FieryFields | FieryChangesCallback,
      callbackOrEquality?: FieryChangesCallback | FieryEquality,
      equalityOrNothing?: FieryEquality) => any
  }

  promise?: Promise<QuerySnapshot>

  off?: () => any

  id?: number

  index?: number

}

export interface FieryInstance
{

  (source: FierySource, options?: string | Partial<FieryOptions>): FieryTarget

  storeKeyNext: number

  stores:
  {
    [storeKey: number]: Firestore
  }

  storeIdToKey:
  {
    [id: string]: number
  }

  options:
  {
    [optionKey: number]: FieryOptions
  }

  entry: FieryEntryMap

  entryList: (FieryEntry | null)[]

  update: (data: FieryData, fields?: FieryFields) => Promise<void> | undefined

  sync: (data: FieryData, fields?: FieryFields) => Promise<void> | undefined

  remove: (data: FieryData) => Promise<void> | undefined

  clear: (data: FieryData, props: FieryFields) => Promise<void> | undefined

  getChanges: (data: FieryData,
    fieldsOrCallback: FieryFields | FieryChangesCallback,
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
