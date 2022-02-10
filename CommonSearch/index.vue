<template>
  <el-form
    ref="form"
    :model="formData"
    :inline="inline"
    :label-width="labelWidth ? labelWidth + 'px' : ''"
    @submit.native.prevent="searchHandler()"
  >
    <el-form-item
      v-for="(item, index) in formItemList"
      :key="index"
      :class="inline ? 'form-item__inline' : 'form-item__block'"
      :prop="
        item.itemType != 'daterange' && item.itemType != 'datetimerange'
          ? item.prop
          : datePrefix + index
      "
      :label="item.label"
      :rules="item.rules || []"
      :label-width="item.labelWidth ? item.labelWidth + 'px' : ''"
    >
      <div>
        <!-- 默认输入框 -->
        <el-input
          v-if="item.itemType === 'input' || item.itemType === undefined"
          v-model="formData[item.modelValue]"
          :size="item.size ? item.size : size"
          :readonly="item.readonly"
          :disabled="item.disabled"
          :placeholder="item.placeholder"
          :style="
            itemStyle + (item.itemWidth ? `width: ${item.itemWidth}px;` : '')
          "
        >
          <template v-if="item.prepend" slot="prepend">
            {{ item.prepend }}
          </template>
        </el-input>

        <!-- 多行输入框 -->
        <el-input
          v-if="item.itemType == 'textarea'"
          type="textarea"
          v-model="formData[item.modelValue]"
          :rows="item.rows || 3"
          :disabled="item.disabled"
          :placeholder="item.placeholder"
        />

        <!-- 数字输入框 -->
        <el-input-number
          v-else-if="item.itemType == 'number'"
          v-model="formData[item.modelValue]"
          :size="item.size ? item.size : size"
          :readonly="item.readonly"
          :disabled="item.disabled"
          :style="
            itemStyle + (item.itemWidth ? `width: ${item.itemWidth}px;` : '')
          "
          :min="item.min || 0"
          :step-strictly="item.stepStrictly"
          :step="item.step || 1"
        />

        <!-- 上传图片 -->
        <upload-file
          :disabled="item.disabled"
          v-else-if="item.itemType == 'upload'"
          :domain="item.domain"
          :actionUrl="item.actionUrl"
          :value-type="item.valueType"
          :file-type="item.fileType"
          :list.sync="formData[item.modelValue]"
          :can-preview="item.canPreview"
          :can-delete="item.canDelete"
          :limit-count="item.limitCount"
          :limit-size="item.limitSize"
          :limit-width="item.limitWidth"
          :size-limit-ckeck="item.sizeLimitCkeck"
          :cover-size-limit-ckeck="item.coverSizeLimitCkeck"
          :banner-size-limit-ckeck="item.bannerSizeLimitCkeck"
          :navigation-size-limit-ckeck="item.navigationSizeLimitCkeck"
          :invite-poster-size-limit-check="item.invitePosterSizeLimitCheck"
        />

        <!-- 下拉框 -->
        <el-select
          v-else-if="item.itemType === 'select'"
          v-model="formData[item.modelValue]"
          :size="item.size ? item.size : size"
          :disabled="item.disabled"
          :multiple="item.multiple"
          :placeholder="item.placeholder"
          :style="
            itemStyle + (item.itemWidth ? `width: ${item.itemWidth}px;` : '')
          "
          @change="(e) => emitEventHandler('change-select', item.prop, e)"
        >
          <el-option
            v-for="(option, optionIndex) in item.options"
            :key="optionIndex + '_local'"
            :value="
              typeof option === 'object'
                ? option[item.valueKey || 'value']
                : option
            "
            :label="
              typeof option === 'object'
                ? option[item.labelKey || 'label']
                : option
            "
          />
          <el-option
            v-for="(op, opIndex) in selectOptions[selectOptionPrefix + index]"
            :key="opIndex + '_remote'"
            :value="typeof op === 'object' ? op[item.valueKey || 'value'] : op"
            :label="typeof op === 'object' ? op[item.labelKey || 'label'] : op"
          />
        </el-select>

        <!-- 单选框 -->
        <el-radio-group
          v-else-if="item.itemType == 'radio'"
          v-model="formData[item.modelValue]"
          :style="
            itemStyle + (item.itemWidth ? `width: ${item.itemWidth}px;` : '')
          "
          @change="(e) => emitEventHandler('change-choose', item.prop, e)"
        >
          <el-radio
            v-for="(radio, radioIndex) in item.options"
            :key="radioIndex"
            :label="radio.label"
          >
            {{ radio.text }}
          </el-radio>
        </el-radio-group>

        <!-- 多选框 -->
        <el-checkbox-group
          v-else-if="item.itemType == 'checkbox'"
          v-model="formData[item.modelValue]"
          :style="
            itemStyle + (item.itemWidth ? `width: ${item.itemWidth}px;` : '')
          "
        >
          <el-checkbox
            v-for="(checkbox, checkboxIndex) in item.options"
            :label="checkbox.label"
            :key="checkboxIndex"
          >
            {{ checkbox.text }}
          </el-checkbox>
        </el-checkbox-group>

        <!-- 日期选择器 -->
        <el-date-picker
          v-else-if="item.itemType === 'date'"
          v-model="formData[item.modelValue]"
          type="date"
          :placeholder="item.placeholder"
          :size="item.size ? item.size : size"
          :disabled="item.disabled"
          :readonly="item.readonly"
          :editable="item.editable"
          :value-format="item.valueFormat || 'yyyy-MM-dd'"
          :style="
            itemStyle + (item.itemWidth ? `width: ${item.itemWidth}px;` : '')
          "
          :picker-options="item.pickerOptions || {}"
        />

        <!-- 日期时间选择器 -->
        <el-date-picker
          v-else-if="item.itemType === 'datetime'"
          v-model="formData[item.modelValue]"
          type="datetime"
          :placeholder="item.placeholder"
          :size="item.size ? item.size : size"
          :disabled="item.disabled"
          :readonly="item.readonly"
          :editable="item.editable"
          :value-format="item.valueFormat || 'yyyy-MM-dd HH:mm:ss'"
          :style="
            itemStyle + (item.itemWidth ? `width: ${item.itemWidth}px;` : '')
          "
          :picker-options="item.pickerOptions || {}"
        />

        <!-- 日期范围选择器 -->
        <el-date-picker
          v-else-if="item.itemType === 'daterange'"
          v-model="formData[item.modelValue]"
          :size="item.size ? item.size : size"
          type="daterange"
          :disabled="item.disabled"
          :readonly="item.readonly"
          :editable="item.editable"
          :value-format="item.valueFormat"
          :placeholder="item.placeholder"
          :style="
            itemStyle + (item.itemWidth ? `width: ${item.itemWidth}px;` : '')
          "
          :picker-options="item.pickerOptions || {}"
          @change="
            (date) =>
              changeDate(
                date,
                item.prop[0],
                item.prop[1],
                item.valueFormat,
                item.isGetTimeStamp,
              )
          "
        />

        <!-- 日期时间范围选择器 -->
        <el-date-picker
          v-else-if="item.itemType == 'datetimerange'"
          v-model="formData[item.modelValue]"
          :size="item.size ? item.size : size"
          type="datetimerange"
          :disabled="item.disabled"
          :readonly="item.readonly"
          :editable="item.editable"
          :placeholder="item.placeholder"
          :style="
            itemStyle + (item.itemWidth ? `width: ${item.itemWidth}px;` : '')
          "
          :picker-options="item.pickerOptions || {}"
          @change="
            (date) =>
              changeDate(
                date,
                item.prop[0],
                item.prop[1],
                item.valueFormat,
                item.isGetTimeStamp,
              )
          "
        />

        <!-- 开关check -->
        <el-checkbox
          v-else-if="item.itemType == 'switch'"
          v-model="formData[item.modelValue]"
          :label="item.checkLabel"
          :true-label="item.trueLabel"
          :false-label="item.falseLabel"
        />

        <template v-else-if="item.itemType == 'custom'">
          <slot
            :name="item.slotName"
            :row="formData[item.prop]"
            :data="formData"
          />
        </template>
      </div>
    </el-form-item>

    <el-form-item
      label=""
      :style="{ display: 'flex', justifyContent: submitBtnFlex }"
    >
      <el-button
        v-if="showConfirmBtn"
        :style="{ marginBottom: '10px' }"
        type="primary"
        :size="size"
        :loading="submitLoading"
        @click="searchHandler"
      >
        {{ submitBtnText }}
      </el-button>

      <el-button
        v-if="showResetBtn"
        type="primary"
        :plain="true"
        :size="size"
        :loading="submitLoading"
        @click="resetForm"
      >
        {{ resetBtnText }}
      </el-button>

      <slot name="btn" />
    </el-form-item>
  </el-form>
</template>

<script>
import { formProps } from './props';
import moment from 'moment';
import uploadFile from '@/components/UploadFile';

const datePrefix = 'daterange-prefix';
const selectOptionPrefix = 'select-option-prefix';

export default {
  name: 'CommonSearchForm',
  components: { uploadFile },
  props: formProps,
  data() {
    const {
      formData,
      datePrefix,
      selectOptionPrefix,
      dataObj,
      format,
      fuzzyOps,
    } = this.initData(true);

    return {
      formData,
      datePrefix,
      selectOptionPrefix,
      ...dataObj,
      format,
      fuzzyOps,
    };
  },
  computed: {
    itemStyle() {
      const { itemWidth } = this;
      if (itemWidth) {
        return `width: ${itemWidth}px;`;
      }
      return '';
    },
    submitBtnFlex() {
      const map = {
        left: 'flex-start',
        mid: 'center',
        right: 'flex-end',
      };
      return map[this.submitBtnPosition];
    },
  },
  watch: {
    localData(data) {
      this.initData(false);
      this.formData = { ...this.formData, ...data };

      if (this.formatter) {
        this.formData = this.formatter(this.formData);
      }

      // 处理时间范围特殊类型
      this.formItemList?.forEach((item, index) => {
        if (item.itemType == 'datetimerange' || item.itemType == 'daterange') {
          this.formData[datePrefix + index] = [data.startTime, data.endTime];
        }
        if (item.formatter && data) {
          this.formData[item.prop] = item.formatter(data[item.prop]);
        }
      });
    },
    formItemList() {
      this.initData(false);
    },
  },
  mounted() {
    if (this.fetch && this.autoFetch) {
      this.fetch(this.fetchParams).then((res) => {
        this.formData = res.data;
        this.$emit('getData', this.formData);
      });
    }
    if (this.localData) {
      this.formData = { ...this.formData, ...this.localData };

      if (this.formatter) {
        this.formData = this.formatter(this.formData);
      }

      // 处理时间范围特殊类型
      this.formItemList?.forEach((item, index) => {
        if (item.itemType == 'datetimerange') {
          this.formData[datePrefix + index] = [
            this.localData.startTime,
            this.localData.endTime,
          ];
        }
        if (item.formatter) {
          this.formData[item.prop] = item.formatter(this.localData[item.prop]);
        }
      });
    }
  },
  methods: {
    initData(isInit) {
      const { formItemList, fuzzy } = this.$props;

      const dataObj = {
        selectOptions: {},
      };
      const formData = {};
      const format = {};
      const fuzzyOps = {};

      formItemList &&
        formItemList.forEach((item, index) => {
          const propType = typeof item.prop;
          if (propType === 'string') {
            item.modelValue = item.prop;
            formData[item.prop] =
              item.initialValue !== undefined || item.initialValue !== ''
                ? item.initialValue
                : '';

            // 兼容多选框情况
            if (item.itemType == 'checkbox') {
              formData[item.prop] = [];
            }

            fuzzyOps[item.prop] = item.fuzzy ? item.fuzzy : fuzzy;
            if (item.format) {
              format[item.prop] = item.format;
            }
          } else if (
            propType === 'object' &&
            Object.prototype.toString.call(item.prop) === '[object Array]'
          ) {
            item.prop.forEach((value) => {
              formData[value] = '';
              if (item.format) {
                format[value] = item.format;
              }

              fuzzyOps[value] = item.fuzzy ? item.fuzzy : fuzzy;
            });
          }
          if (
            item.itemType === 'daterange' ||
            item.itemType === 'datetimerange'
          ) {
            formData[datePrefix + index] = '';
            item.modelValue = datePrefix + index;
          }
          if (item.itemType === 'select' && item.selectFetch && isInit) {
            const dataKey = selectOptionPrefix + index;
            dataObj.selectOptions[dataKey] = [];
            this.getRemoteData({
              fetch: item.selectFetch,
              dataKey,
              resultField: item.selectResultField || 'data',
              resultHandler: item.selectResultHandler,
            });
          }
        });

      return {
        formData,
        datePrefix,
        selectOptionPrefix,
        dataObj,
        format,
        fuzzyOps,
      };
    },
    emitEventHandler(event) {
      this.$emit(event, ...Array.from(arguments).slice(1));
    },
    isArray(value) {
      return (
        typeof value === 'object' &&
        Object.prototype.toString.call(value) === '[object Array]'
      );
    },
    searchHandler() {
      this.getParams((error, params) => {
        if (!error) {
          const { submitHandler } = this;
          if (submitHandler) {
            submitHandler(params);
          } else {
            throw new Error('找不到submitHandler函数!');
          }
        }
      });
    },
    getParamFuzzy() {
      return this.fuzzyOps;
    },
    getParams(callback) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const { formData, datePrefix, format } = this;
          const formattedForm = {};
          console.log({ formData, datePrefix, format });
          Object.keys(formData).forEach((v) => {
            if (v.indexOf(datePrefix) === -1) {
              formattedForm[v] = format[v]
                ? format[v](formData[v], v)
                : formData[v];
            }
          });
          if (callback) callback(null, formattedForm);
        } else {
          if (callback) callback(new Error());
        }
      });
    },
    resetForm() {
      this.$refs['form'].resetFields();

      const formKeys = Object.keys(this.formData);
      formKeys.forEach((i) => {
        this.formData[i] = '';
      });

      const { resetBtnCallback } = this;
      if (resetBtnCallback) resetBtnCallback();
    },
    changeDate(
      date,
      startDate,
      endDate,
      valueFormat = 'yyyy-MM-dd HH:mm:ss',
      isGetTimeStamp = false,
    ) {
      let dates;
      // 兼容moment valueFormat
      const momentFormat = valueFormat.replaceAll('dd', 'DD');
      if (date === null) {
        this.formData[startDate] = '';
        this.formData[endDate] = '';
        return;
      }
      if (typeof date === 'string') {
        dates = date.split(' - ');
        // eslint-disable-next-line no-prototype-builtins
      } else if (date && date.hasOwnProperty('length')) {
        const firstDate = date[0];
        const secondDate = date[1];
        if (isGetTimeStamp) {
          dates = [
            new Date(firstDate).getTime(),
            new Date(secondDate).getTime(),
          ];
        } else {
          dates = [
            // YYYY-MM-DD HH:mm:ss
            moment(firstDate).format(momentFormat),
            moment(secondDate).format(momentFormat),
          ];
        }
      }

      this.formData[startDate] = dates[0];
      this.formData[endDate] = dates[1];
    },
    getRemoteData({ fetch, dataKey, resultField, resultHandler }) {
      fetch().then((response) => {
        let result = response;
        if (typeof response === 'object' && !this.isArray(response)) {
          if (resultField.indexOf('.') !== -1) {
            resultField.split('.').forEach((value) => {
              result = result[value];
            });
          } else {
            result = response[resultField];
          }
        }

        if (!result || !(result instanceof Array)) {
          console.warn(
            `The result of key:${resultField} is not Array. 接口返回的字段:${resultField} 不是一个数组`,
          );
        }

        if (resultHandler) {
          this.selectOptions[dataKey] = result.map(resultHandler);
        } else {
          this.selectOptions[dataKey] = result;
        }

        if (this.getSelectDataFinish) {
          this.getSelectDataFinish(this.selectOptions[dataKey]);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.form-item_inline {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.form-block {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.disable {
  pointer-events: none;
  * {
    pointer-events: none;
  }
}
</style>
