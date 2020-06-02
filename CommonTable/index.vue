<template>
  <div>
    <el-table
      ref="table"
      v-loading.lock="loading"
      :data="tableData"
      :row-key="rowKey"
      :lazy="treeTableLazy"
      :load="loadChildData"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      @row-click="(row, event, column) => emitEventHandler('row-click', row, event, column)"
      @sort-change="args => emitEventHandler('sort-change', args)"
      @selection-change="selection => emitEventHandler('selection-change', selection)"
    >
      <template v-for="(column, columnIndex) in freezeColumn">
        <el-table-column
          v-if="column.type === undefined"
          :key="columnIndex"
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth || 120"
          :fixed="column.fixed"
          :sortable="column.sortable"
          :sort-by="column.sortBy"
          :formatter="column.formatter"
          :align="column.align"
          :header-align="column.headerAlign || column.align"
        >
          <template slot-scope="scope" :scope="'scope'">
            <span v-if="column.slotName">
              <slot :name="column.slotName" :row="scope.row" :$index="scope.$index" />
            </span>
            <span v-else-if="column.formatter">
              {{ column.formatter(scope.row, scope.column, scope.row[column.prop], scope.$index) }}
            </span>
            <span v-else>
              {{ scope.row[column.prop] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-else :key="columnIndex" v-bind="column" />
      </template>
    </el-table>

    <div
      v-if="showPagination"
      :style="{ marginTop: '10px', textAlign: 'center' }"
    >
      <el-pagination
        :current-page="pagination.pageIndex"
        :page-sizes="pageSizes"
        :page-size="pagination.pageSize"
        :layout="paginationLayout"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { tableProps } from './props'

export default {
  name: 'CommonTable',
  props: tableProps,
  data() {
    const _this = this
    return {
      loading: false,
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: (() => {
          const { pageSizes } = _this
          if (pageSizes && pageSizes.length > 0) {
            return pageSizes[0]
          }
          return 10
        })()
      },
      total: 0,
      cacheLocalData: []
    }
  },
  computed: {
    freezeColumn() {
      return this.columns && Object.freeze(this.columns)
    }
  },
  watch: {
    data(value) {
      this.loadLocalData(value)
    }
  },
  mounted() {
    if (this.type === 'remote' && this.autoLoad) {
      this.fetchHandler(this.params)
    } else if (this.type === 'local') {
      this.loadLocalData(this.data)
    }
  },
  methods: {
    // 切换每页数据量
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.dataChangeHandler()
    },
    // 切换页数
    handleCurrentChange(pageIndex) {
      this.pagination.pageIndex = pageIndex
      this.dataChangeHandler()
    },
    // 外部调用的搜索刷新
    searchHandler(...searchForm) {
      this.pagination.pageIndex = 1
      this.dataChangeHandler(...searchForm)
    },
    // 请求接口数据或者获取本地数据
    dataChangeHandler(...data) {
      if (this.type === 'local') {
        this.dataFilterHandler(...data)
      } else if (this.type === 'remote') {
        this.fetchHandler(...data)
      }
    },
    // 筛选出当前页的数据
    dataFilter(data) {
      const { pageIndex, pageSize } = this.pagination
      return data.filter((v, i) => {
        return i >= (pageIndex - 1) * pageSize && i < pageIndex * pageSize
      })
    },
    // 处理本地数据
    dataFilterHandler(formParams) {
      const { cacheLocalData, params } = this
      const mergeParams = Object.assign(params, formParams)
      const validParamKeys = Object.keys(mergeParams).filter(v => {
        return mergeParams[v] !== undefined && mergeParams[v] !== ''
      })
      const searchForm = this.$parent.$refs['form']
      let paramFuzzy
      if (searchForm) {
        paramFuzzy = searchForm.getParamFuzzy()
      }

      if (validParamKeys.length > 0) {
        const validData = cacheLocalData.filter(v => {
          const valids = []
          validParamKeys.forEach(vv => {
            if (typeof v[vv] === 'number') {
              valids.push(
                paramFuzzy && paramFuzzy[vv] ? (String(v[vv]).indexOf(String(mergeParams[vv])) !== -1)
                  : (String(v[vv]) === String(mergeParams[vv]))
              )
            } else {
              valids.push(
                paramFuzzy && paramFuzzy[vv] ? (v[vv].indexOf(mergeParams[vv]) !== -1) : (v[vv] === mergeParams[vv])
              )
            }
          })
          return valids.every(vvv => {
            return vvv
          })
        })

        this.tableData = this.dataFilter(validData)
        this.total = validData.length
      } else {
        this.total = cacheLocalData.length
        this.tableData = this.dataFilter(cacheLocalData)
      }
    },
    // 获取接口数据
    fetchHandler(formParams = {}) {
      this.loading = true
      let { params } = this
      const { showPagination, pagination, totalField, pageSizeKey, pageIndexKey, listField, fetch } = this

      params = JSON.parse(JSON.stringify(Object.assign(params, formParams)))

      if (showPagination) {
        params = Object.assign(params, {
          [pageIndexKey]: pagination.pageIndex,
          [pageSizeKey]: pagination.pageSize
        })
      }

      if (!fetch) {
        console.log('请传入请求函数')
        this.loading = false
        return
      }

      fetch(params).then(response => {
        let result = response

        if (response && !(response instanceof Array)) {
          if (listField && listField.indexOf('.') !== -1) {
            listField.split('.').forEach(i => {
              result = result[i]
            })
          } else {
            result = response[listField]
          }
        }

        if (!result || !(result instanceof Array)) {
          this.loading = false
          return
        }

        if (this.dataHandler) {
          this.tableData = result.map(this.dataHandler)
        } else {
          this.tableData = result
        }

        let totalValue = response
        if (Object.prototype.toString.call(response) === '[object Array]') {
          totalValue = response.length
        } else if (typeof response === 'object') {
          if (totalField && totalField.indexOf('.') !== -1) {
            totalField.split('.').forEach(i => {
              totalValue = totalValue[i]
            })
          } else {
            totalValue = response[totalField]
          }
        } else {
          totalValue = 0
        }
        this.total = +totalValue

        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 触发自定义事件
    emitEventHandler(event) {
      this.$emit(event, ...Array.from(arguments).slice(1))
    },
    // 获取本地数据
    loadLocalData(data) {
      const { autoLoad } = this
      if (!data) {
        console.error('')
        return
      }
      const cacheData = JSON.parse(JSON.stringify(data))
      this.cacheLocalData = cacheData
      if (autoLoad) {
        this.tableData = this.dataFilter(cacheData)
        this.total = cacheData.length
      }
    }
  }
}
</script>
