### 公用 table 表格组件

基本用法：(下方有详细属性 prop)

1. 接口数据表格

```html
<common-table
  ref="table"
  :type="`remote`"
  :columns="columns"
  :fetch="getTable"
  :list-field="`data`"
  :total-field="`total`"
  :page-sizes="[1, 10, 20]"
/>
```

```javascript
import { getTable } from '@/api/test'

data() {
  return {
    getTable,
    columns: [
      { prop: 'name', label: 'Name', minWidth: 100 },
      { prop: 'mobile', label: 'Mobile', minWidth: 100 },
      { prop: 'sex', label: 'Sex', minWidth: 100 }
    ]
  }
}
```

2. 接口数据表格 + 表单搜索

```html
<common-search-form
  :form-item-list="formItemList"
  :inline="true"
  :input-width="200"
  :show-reset-btn="true"
  :submit-handler="submitHandler"
/>
<common-table
  ref="table"
  :type="`remote`"
  :columns="columns"
  :fetch="getTable"
  :list-field="`data`"
  :total-field="`total`"
  :page-sizes="[1, 10, 20]"
/>
```

```javascript
import CommonTable from '@/components/CommonTable'
import CommonSearchForm from '@/components/CommonSearchForm'

import { getTable } from '@/api/test'

data() {
  return {
      getTable,
      formItemList: [
        { prop: 'name', label: 'Name' },
        { prop: 'mobile', label: 'Mobile' },
        { prop: 'sex', label: 'Sex' }
      ],
      columns: [
        { prop: 'name', label: 'Name', minWidth: 100 },
        { prop: 'mobile', label: 'Mobile', minWidth: 100 },
        { prop: 'sex', label: 'Sex', minWidth: 100 }
      ],
  }
},
methods: {
  submitHandler(form) {
    this.$refs.table.searchHandler(form)
  }
}
```

3. 表格有自定义数据

```html
<common-table
  ref="table"
  :type="`remote`"
  :columns="columns"
  :fetch="getTable"
  :list-field="`data`"
  :total-field="`total`"
  :page-sizes="[1, 10, 20]"
>
  <!-- 自定义插图片 -->
  <template v-slot:img="scope">
    <img :src="scope.row.img" />
  </template>
  <!-- 自定义插按钮 -->
  <template v-slot:btn="scope">
    <el-button type="primary" v-if="scope.row.status">删除</el-button>
  </template>
</common-table>
```

```javascript
import CommonTable from '@/components/CommonTable';

import { getTable } from '@/api/test';

export default {
  name: 'TestTable',
  components: { CommonTable },
  data() {
    return {
      getTable,
      columns: [
        { prop: 'name', label: 'Name', minWidth: 100 },
        { prop: 'mobile', label: 'Mobile', minWidth: 100 },
        {
          prop: 'sex',
          label: 'Sex',
          minWidth: 100,
          // 数据格式处理器
          formatter: (row) => {
            return row.sex ? '女' : '男';
          },
        },
        // img插槽
        { prop: 'img', label: 'Pic', minWidth: 400, slotName: 'img' },
        // btn插槽
        { prop: 'status', label: '状态', minWidth: 120, slotName: 'btn' },
      ],
    };
  },
  methods: {
    submitHandler(form) {
      this.$refs.table.searchHandler(form);
    },
  },
};
```

---

<common-table />详细属性 prop 文档：

1. fetch: 表格获取接口数据的请求方法 - Function
2. listField: 获取的接口里的表格的字段 - String 默认值: "data.list" 如果在 data 直接填'data',在 data.contentList 就写'data.contentList'
3. totalField: 获取的接口里的 total 的字段 - String 默认值: "data.total" 同上
4. params: 表格获取接口数据的请求方法想要携带的参数 - Object 默认值: {}
5. autoLoad: 是否加载页面自动加载表格数据 - Boolean 默认值: true
6. type: 当前表格是要请求接口数据 还是 本地写死数据 - String 可选值: 'local' 'remote' 默认值: 'remote'
7. data: 表格是本地写死数据时候，传入的表格数据 - Array
8. dataHandler: 获取接口数据时候的数据数据处理器 - Function
9. showPagination: 是否展示分页 - Boolean 默认值: true
10. pageSizes: 表格展示的数据行数，传入数组，可添加多行数下拉框数据 -Array 例如: [5, 10, 20] 可分别选 5、10、20 行数据, 仅需 5 行的话可只传[5] 默认值：[10]
11. paginationLayout: 分页器的摆放顺序 - Array 默认值: 'total, prev, pager, next, jumper, sizes'
12. pageIndexKey: 返回接口的当前页数的字段 - String 默认值: 'pageIndex' 如果字段是 currentPage,则传入'currentPage'
13. pageSizeKey: 返回接口的当前行数的字段 - String 默认值: 'pageSize' 同上
14. columns: 表格的列信息(必须携带:prop 列数据的字段, label 列表头的名字 ... )
15. getDataFinish: 获取 tableData 后执行回调
16. canEdit: 是否单元格可编辑

"columns"属性中各个输入框的配置文档:

1. label: 该列的表头文字 - String
2. prop: 该列的数据、接口字段- String
3. minWidth: 调整该列的最小宽度 - Number
4. fixed: 该列是否钉住在最左边或者最右边 - [Boolean, String] 默认值: false
5. sortable: 该列是否可排序 - [Boolean, String] 默认值: false
6. formatter(行信息, 列信息, 当前行列数据, 当前第几个行): 该列的数据格式转化器 - Function
7. align: 列的表格数据的位置 - String 可选: 'left' 'center' 'right' 默认值: 'left'
8. headerAlign: 列的表头文字的文字的位置 - String 可选: 'left' 'center' 'right'
9. slotName: 该列的自定义插槽的名字 - String
