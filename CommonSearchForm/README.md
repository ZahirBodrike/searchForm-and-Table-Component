### 公用的搜索表单组件

目前支持：input, date, select, daterange

基本用法：(下方有详细属性prop)
```html
<!-- template -->
<common-search-form
  :form-item-list="formItemList"
  :inline="true"
  :item-width="200"
  :show-reset-btn="true"
  :submit-handler="submitHandler"
/>
```

```javascript
import CommonSearchForm from '@/components/CommonSearchForm' // 引入本组件
import { selectList } from '@/api/remote-search' // 获取数据的select下拉框

export default {
  name: 'TestSearch',
  components: { CommonSearchForm }, // 注册组件
  data() {
    return {
      // 表单各个输入框、查询框的类型配置 示例：
      formItemList: [
        // 普通输入框
        { prop: 'age', label: '年龄' },
        // 带有校验的普通输入框
        { prop: 'name', label: 'Name', rules: [{ required: true, message: '请输入活动名称', trigger: 'blur' }] },
        // 写死的本地下拉框
        { prop: 'sex', label: 'Sex', itemType: 'select',
          options: [
            { value: '', label: 'All' },
            { value: 0, label: 'Male' },
            { value: 1, label: 'Female' }
          ]
        },
        // 获取后端接口的远程下拉框
        { 
          prop: 'remote',
          label: '远程',
          itemType: 'select',
          selectFetch: selectList,
          selectResultField: 'data.list' },
        // 选取某天的日期+时间
        {
          prop: 'time1', label: '时间1', itemType: 'date'
        },
        // 选择某天到某天
        {
          prop: ['startTime', 'endTime'], label: '时间2', itemType: 'daterange'
        }
      ]
    }
  },
  methods: {
    // 处理查询事件
    submitHandler(e) {
      console.log(e)
    }
  }
}
```
#### 注意⚠️：搜索框顺序建议为input -> select -> date -> daterange，也就是上方formItemList从上到下的顺序

如果要插入其他自定义按钮：
```html
<common-search-form>
  <!-- 加入 v-slot:btn -->
  <template v-slot:btn>
    <el-button />
  </template>
</common-search-form>
```

-----------------------------------------

<common-search-form />详细属性prop文档：

1. size: 当前组件各个框和按钮的大小类型(全部) - String 可选:large, small, mini 默认值：'small'
2. showResetBtn: 是否显示“重置”按钮 - Boolean 默认值：false
3. inline: 是否表单横向排列 - Boolean 默认值：false
4. labelWidth: 输入框前方label的宽度(全部) - Number 默认值：'100px'
5. itemWidth: 输入框的宽度(全部) - Number 默认值：''
6. submitHandler: 处理提交事件 - Function 
7. submitLoading: 是否开启提交按钮的loading - Boolean 默认值：false
8.  submitBtnText: 提交按钮的文案 默认值：'查询'
9.  resetBtnText: 重置按钮的文案 默认值：'重置'
10. resetBtnCallback: 处理重置按钮的事件 - Function
11. formItemList: 传入的表单配置 - Array

"formItemList"属性中各个输入框的配置文档:

1. label: 输入框前方label的文案 - String
2. prop: 发送表单时所属的字段 - String
3. itemType: 该输入框为什么类型 - String 可选: input, select, date, daterange 默认值：'input'
4. size: 当前组件各个框和按钮的大小类型(单个) - String
5. placeholder: 输入框为空时提示语 - String 默认值：'请输入'
6. labelWidth: 输入框前方label的宽度(单个) - Number 默认值：'100px'
7. itemWidth: 输入框的宽度(单个) - Number 默认值：''
8. editable: 时间类型时 输入框是否输入 - Boolean true
9.  disabled: 输入框禁用 - Boolean 默认值：false
10. readonly: 输入框只读 - Boolean 默认值：false
11. options: 写死select时候的下拉框选项 - Array
12. selectFetch: 获取后端接口的select的请求方法 - Function
13. selectResultField: 接口中的哪个字段为select的options的list - String 默认值：'data'
    如果返回{ code:200, data:[(目标List)] } 则 selectResultField: 'data'
    如果返回{ code:200, data:{ id:1, list:[(目标list)] } } 则 selectResultField: 'data.list'
14. selectResultHandler: 处理获取远程select的数据处理器 - Function
15. labelKey: select的label对应的字段 - String 默认值：'label'
16. valueKey: select的value对应的字段 - String 默认值：'value'
17. rules: 当前输入框的校验规则 - Array 默认值：[]
18. format: 格式化表单字段 - Function
19. pickerOptions: 时间类型输入框的配置 - Object 默认值：{}

