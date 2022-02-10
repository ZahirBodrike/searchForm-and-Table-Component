export const tableProps = {
  canEdit: {
    type: Boolean,
    default: false,
  },
  fetch: {
    type: Function,
  },
  listField: {
    type: String,
    default: 'data.list',
  },
  totalField: {
    type: String,
    default: 'data.total',
  },
  params: {
    type: Object,
    default: () => {
      return {};
    },
  },
  getDataFinish: {
    type: Function,
    default: () => {},
  },
  autoLoad: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: 'remote',
    validator(value) {
      const types = ['remote', 'local'];
      const validType = types.indexOf(value) !== -1;
      if (!validType) {
        throw new Error(`prop属性：'${value}'请选择 'remote'或者'local'.`);
      }
      return validType;
    },
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  treeTableLazy: {
    type: Boolean,
    default: true,
  },
  loadChildData: {
    type: Function,
  },
  data: {
    type: Array,
  },
  dataHandler: {
    type: Function,
  },
  columns: {
    type: Array,
    required: true,
    label: {
      type: String,
      required: true,
    },
    prop: {
      type: String,
      required: true,
    },
    minWidth: Number,
    fixed: [Boolean, String],
    sortable: [Boolean, String],
    formatter: Function,
    align: {
      type: String,
      default: 'left',
    },
    headerAlign: String,
    slotName: {
      type: String,
    },
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  pageSizes: {
    type: Array,
    default: () => {
      return [20, 50, 100];
    },
  },
  paginationLayout: {
    type: String,
    default: 'total, prev, pager, next, jumper, sizes',
  },
  pageIndexKey: {
    type: String,
    default: 'pageNo',
  },
  pageSizeKey: {
    type: String,
    default: 'pageSize',
  },
};
