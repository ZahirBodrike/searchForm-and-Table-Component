<template>
  <div class="components-uploadFile">
    <draggable
      :list="fileList"
      class="el-upload-list el-upload-list--picture-card el-upload-custom-show"
    >
      <!-- 展示已上传图片 -->
      <template v-if="fileType == 'img'">
        <div
          v-for="(item, index) in fileList"
          :key="index"
          class="el-upload-list__item is-success"
        >
          <label class="el-upload-list__item-status-label">
            <i class="el-icon-upload-success el-icon-check" />
          </label>
          <el-image
            :src="formatImageUrl(item.url)"
            class="el-upload-list__item-thumbnail"
            :preview-src-list="[formatImageUrl(item.url)]"
          />
          <span v-if="item.name" class="name">{{ item.name }}</span>
          <div class="el-upload-mask">
            <span
              v-if="canPreview"
              class="el-icon-zoom-in"
              @click="showViewer = true"
            />
            <span
              v-if="canDelete"
              class="el-icon-delete"
              @click="onHandleRemoveImgItem(index)"
            />
            <slot name="button" />
          </div>
        </div>
      </template>

      <!-- 展示已上传文件 -->
      <template v-else>
        <p
          v-if="canDelete && fileList.length >= limitCount"
          class="el-icon-delete"
          @click="onHandleRemoveImgItem(index)"
        />
        <h2 v-for="file in fileList" :key="file.url">{{ file.url }}</h2>
      </template>
    </draggable>

    <!-- 上传器 -->
    <el-upload
      v-show="fileList.length < limitCount"
      :on-exceed="onHandleExceed"
      :on-remove="onHandleRemove"
      :on-success="onHandleSuccess"
      :on-error="onHandleError"
      :before-upload="beforeUploadImages"
      :limit="limitCount"
      :action="actionUrl"
      :file-list="fileList"
      :multiple="true"
      :auto-upload="true"
      :show-file-list="false"
      list-type="picture-card"
      class="el-upload-custom"
    >
      <i class="el-icon-plus" />
    </el-upload>

    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="showViewer"
      :zIndex="9999"
      :on-close="
        () => {
          showViewer = false;
        }
      "
      :url-list="fileList.map((i) => formatImageUrl(i.url))"
    />
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { IMG_UPLOAD_URL } from '@/api';
import ElImageViewer from 'element-ui/packages/image/src/image-viewer';
import { formatImageUrl } from '@/utils';

export default {
  name: 'UploadFile',
  components: { draggable, ElImageViewer },
  props: {
    /* 是否显示预览 */
    canPreview: {
      type: Boolean,
      default: true,
    },

    /* 是否显示删除 */
    canDelete: {
      type: Boolean,
      default: true,
    },

    /* 图片发送请求的地址 */
    actionUrl: {
      type: String,
      default: IMG_UPLOAD_URL,
    },

    /* 最大上传文件数 */
    limitCount: {
      type: Number,
      default: 1,
    },

    /* 限制图片大小(k) */
    limitSize: {
      type: Number,
      default: 700,
    },

    /* 限制图片宽度(px) */
    limitWidth: {
      type: [Number, Array],
      default: -1,
    },

    /* 限制图片高度(px) */
    limitHeight: {
      type: [Number, Array],
      default: -1,
    },

    /* 如果限制为1张时为字符串,绑定时必须加sync修饰符 */
    list: {
      type: [Array, String],
      default: () => '',
      required: true,
    },

    /* 开启图片尺寸校验 */
    sizeLimitCkeck: {
      type: Boolean,
      default: false,
    },

    /* 值的类型 */
    valueType: {
      type: String,
      default: 'url', // url, path
    },

    /* 文件类型 */
    fileType: {
      type: String,
      default: 'img', // img, other...
    },
  },

  data() {
    return {
      fileList: [], // 和list互斥
      isListWatch: false,
      isFileListWatch: false,
      showViewer: false,
    };
  },

  watch: {
    fileList(newVal) {
      this.imgObjToStr(newVal);
    },

    list(newVal) {
      this.imgSrtToObj(newVal);
    },
  },

  created() {
    if (this.list) this.imgSrtToObj(this.list); // 为了兼容父级没有声明，初始化无法侦听改变
  },

  methods: {
    formatImageUrl,

    /** 图片字符串转换上传对象 */
    imgSrtToObj(newVal) {
      if (this.isFileListWatch) {
        // 如果fileList修改格式，list就不需要修改，避免死循环和重复修改
        this.isFileListWatch = false;
      } else {
        this.isListWatch = true;
        const orgList =
          typeof newVal === 'string' || newVal == null || this.limitCount === 1
            ? newVal !== '' && newVal != null
              ? [newVal]
              : []
            : newVal;
        const newList = [...orgList].map((item) => {
          return { url: item };
        });
        this.fileList = newList;
      }
    },

    /** 图片上传对象转换字符串 */
    imgObjToStr(newVal) {
      if (this.isListWatch) {
        // 如果list修改格式，fileList就不需要修改，避免死循环和重复修改
        this.isListWatch = false;
      } else {
        this.isFileListWatch = true;
        const newList = [...newVal].map((item) => {
          return item ? item[this.valueType] : null;
        });
        const resList =
          typeof newVal === 'string' || newVal == null || this.limitCount === 1
            ? newList.length > 0
              ? newList[0]
              : ''
            : newList;
        this.$emit('update:list', resList);
      }
    },

    /** 图片上传错误 */
    onHandleError(error) {
      this.$message.error(`图片上传失败！Message: ${error}`);
    },

    /** 超过限制 */
    onHandleExceed(files, fileList) {
      this.$message.error(
        `当前选择超出限制，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`,
      );
    },

    /** 图片上传前 */
    beforeUploadImages(file) {
      console.log(file);
      const list = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const isImage = list.includes(file.type);
      console.log(this.limitSize, file.size / 1024);
      const isLtSize = file.size / 1024 < this.limitSize;

      if (this.fileType == 'img') {
        if (!isImage) {
          this.$message.error('上传图片只能是jpg/jpeg/png/gif格式!');
          return false;
        }
        if (!isLtSize) {
          this.$message.error(`缩略图片大小不能超过${this.limitSize}K!`);
          return false;
        }
      }
      if (this.sizeLimitCkeck) {
        return this.valSize(file);
      }

      if (this.limitWidth > 0) {
        // 有宽度限制
        return this.valWidth(file);
      } else {
        return true;
      }
    },

    /** 如果设置宽度限制，只校验图片宽度 */
    valWidth(file) {
      return new Promise((resolve, reject) => {
        const _URL = window.URL || window.webkitURL;
        const image = new Image();
        image.src = _URL.createObjectURL(file);
        image.onload = () => {
          const valid = image.width <= this.limitWidth;
          valid ? resolve() : reject();
        };
      }).then(
        () => {
          return file;
        },
        () => {
          this.$message.error(`上传图片的宽度必须小于${this.limitWidth}`);
          return Promise.reject();
        },
      );
    },

    /** 如果开启宽高检查，可校验图片规格 */
    valSize(file) {
      if (this.limitWidth <= 0 || this.limitHeight <= 0) {
        console.error('请传入校验的宽高');
        return false;
      }
      return new Promise((resolve, reject) => {
        const _URL = window.URL || window.webkitURL;
        const image = new Image();
        image.src = _URL.createObjectURL(file);
        image.onload = () => {
          let valid = null;

          if (
            Array.isArray(this.limitWidth) &&
            Array.isArray(this.limitHeight)
          ) {
            /* limitWidth和limitHeight是数组的多种情况 */
            valid =
              this.limitWidth.includes(image.width) &&
              this.limitHeight.includes(image.height);
          } else {
            /* limitWidth和limitHeight全等于 */
            valid =
              image.width === this.limitWidth &&
              image.height === this.limitHeight;
          }
          valid ? resolve() : reject();
        };
      }).then(
        () => {
          return file;
        },
        () => {
          this.$message.error(
            `上传图片尺寸必须等于 ${this.limitWidth} * ${this.limitHeight}`,
          );
          return Promise.reject();
        },
      );
    },

    /** 图列表上传成功 */
    onHandleSuccess(res) {
      if (res.code !== 0) {
        this.$message({
          message: res.message,
          type: 'error',
        });
        return;
      }
      this.$message({
        message: `上传成功`,
        type: 'success',
      });
      this.fileList.push({
        url: this.fileType == 'img' ? res.data.imageSrc : res.data.fullFileSrc,
        path: res.data.relativeFileSrc,
      });
    },

    /** 图列表删除 */
    onHandleRemove(file) {
      const index = this.fileList.indexOf(file);
      if (index > -1) this.fileList.splice(index, 1);
    },

    /** 拖拽列表删除 */
    onHandleRemoveImgItem(index) {
      this.fileList.splice(index, 1);
    },

    /** 设置图片（用于重置） */
    setList(list) {
      this.fileList = list;
    },
  },
};
</script>

<style scoped lang="scss">
.el-upload-custom-show,
.el-upload-custom {
  display: inline-block;
}

.el-upload-custom-show {
  .el-upload-list__item {
    position: relative;
    border: 1px solid #e3e3e3;
    &:hover {
      .el-upload-mask {
        opacity: 1;
      }
    }
    .name {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      font-size: 14px;
      line-height: 16px;
      color: white;
      word-break: break-all;
      text-align: center;
      background: rgba(0, 0, 0, 0.5);
    }
  }
  .el-upload-mask {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    opacity: 0;
    font-size: 18px;
    transition: opacity 0.2s ease;
    justify-content: center;
    align-items: center;
    span {
      width: 25%;
      height: 25%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 0 5px;
    }
  }
}

.dialog-item {
  width: 100%;
  height: 100%;
  display: flex;
  justify-items: center;
  align-items: center;
  background: #e3e3e3;
  padding: 10px;
  & > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>

<style lang="scss">
.el-upload-mask {
  span {
    width: 25%;
    height: 25%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin: 0 5px;
  }
}
</style>

