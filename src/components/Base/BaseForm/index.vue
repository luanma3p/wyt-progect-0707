<script setup lang="ts">
import { ref } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElSwitch,
  ElRadioGroup,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
  ElCascader,
} from 'element-plus'
import type { FormInstance, FormItemRule } from 'element-plus'
import type { FormField } from './types'

const props = withDefaults(
  defineProps<{
    fields: FormField[]
    modelValue: Record<string, unknown>
    labelWidth?: string
    labelPosition?: 'left' | 'right' | 'top'
    inline?: boolean
    disabled?: boolean
  }>(),
  {
    labelWidth: '100px',
    labelPosition: 'right',
    inline: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>): void
}>()

const elFormRef = ref<FormInstance>()

function isVisible(field: FormField): boolean {
  if (!field.visibleIf) return true
  try {
    return field.visibleIf(props.modelValue)
  } catch {
    return true
  }
}

function isDisabled(field: FormField): boolean {
  if (props.disabled) return true
  if (typeof field.disabled === 'function') return field.disabled(props.modelValue)
  return !!field.disabled
}

function buildRules(field: FormField): FormItemRule[] {
  const rules: FormItemRule[] = []
  if (field.required) {
    rules.push({ required: true, message: `请输入${field.label}`, trigger: 'blur' })
  }
  if (field.rules) rules.push(...field.rules)
  return rules
}

function updateValue(prop: string, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [prop]: value })
}

/** 暴露 ElForm 实例方法，便于父组件调用 validate / resetFields */
defineExpose({
  validate: (cb?: Parameters<FormInstance['validate']>[0]) => elFormRef.value?.validate(cb),
  resetFields: (fields?: Parameters<FormInstance['resetFields']>[0]) =>
    elFormRef.value?.resetFields(fields),
  clearValidate: (fields?: Parameters<FormInstance['clearValidate']>[0]) =>
    elFormRef.value?.clearValidate(fields),
  scrollToField: (prop: string) => elFormRef.value?.scrollToField(prop),
})
</script>

<template>
  <ElForm
    ref="elFormRef"
    :model="modelValue"
    :label-width="labelWidth"
    :label-position="labelPosition"
    :inline="inline"
    :disabled="disabled"
  >
    <template v-for="field in fields" :key="field.prop">
      <ElFormItem
        v-if="isVisible(field)"
        :label="field.label"
        :prop="field.prop"
        :rules="buildRules(field)"
        :span="field.span"
      >
        <!-- 插槽自定义 -->
        <slot v-if="field.type === 'slot'" :name="field.prop" :form="modelValue" />
        <!-- 输入框 -->
        <ElInput
          v-else-if="field.type === 'input'"
          :model-value="modelValue[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          :clearable="field.clearable"
          :disabled="isDisabled(field)"
          v-bind="field.attrs"
          @update:model-value="(v: any) => updateValue(field.prop, v)"
        />
        <!-- 文本域 -->
        <ElInput
          v-else-if="field.type === 'textarea'"
          type="textarea"
          :model-value="modelValue[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          :disabled="isDisabled(field)"
          v-bind="field.attrs"
          @update:model-value="(v: any) => updateValue(field.prop, v)"
        />
        <!-- 数字 -->
        <ElInputNumber
          v-else-if="field.type === 'number'"
          :model-value="modelValue[field.prop] as number"
          :disabled="isDisabled(field)"
          v-bind="field.attrs"
          @update:model-value="(v: any) => updateValue(field.prop, v)"
        />
        <!-- 下拉 -->
        <ElSelect
          v-else-if="field.type === 'select'"
          :model-value="modelValue[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable"
          :disabled="isDisabled(field)"
          style="width: 100%"
          v-bind="field.attrs"
          @update:model-value="(v: any) => updateValue(field.prop, v)"
        >
          <ElOption
            v-for="opt in field.options"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
            :disabled="opt.disabled"
          />
        </ElSelect>
        <!-- 日期 -->
        <ElDatePicker
          v-else-if="field.type === 'date' || field.type === 'daterange'"
          :type="field.type"
          :model-value="modelValue[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable"
          :disabled="isDisabled(field)"
          style="width: 100%"
          v-bind="field.attrs"
          @update:model-value="(v: any) => updateValue(field.prop, v)"
        />
        <!-- 开关 -->
        <ElSwitch
          v-else-if="field.type === 'switch'"
          :model-value="!!modelValue[field.prop]"
          :disabled="isDisabled(field)"
          @update:model-value="(v: any) => updateValue(field.prop, v)"
        />
        <!-- 单选组 -->
        <ElRadioGroup
          v-else-if="field.type === 'radio'"
          :model-value="modelValue[field.prop]"
          :disabled="isDisabled(field)"
          @update:model-value="(v: any) => updateValue(field.prop, v)"
        >
          <ElRadio v-for="opt in field.options" :key="String(opt.value)" :value="opt.value">
            {{ opt.label }}
          </ElRadio>
        </ElRadioGroup>
        <!-- 多选组 -->
        <ElCheckboxGroup
          v-else-if="field.type === 'checkbox'"
          :model-value="modelValue[field.prop]"
          :disabled="isDisabled(field)"
          @update:model-value="(v: any) => updateValue(field.prop, v)"
        >
          <ElCheckbox v-for="opt in field.options" :key="String(opt.value)" :value="opt.value">
            {{ opt.label }}
          </ElCheckbox>
        </ElCheckboxGroup>
        <!-- 级联 -->
        <ElCascader
          v-else-if="field.type === 'cascader'"
          :model-value="modelValue[field.prop]"
          :disabled="isDisabled(field)"
          style="width: 100%"
          v-bind="field.attrs"
          @update:model-value="(v: any) => updateValue(field.prop, v)"
        />
      </ElFormItem>
    </template>
  </ElForm>
</template>
