module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档变更
        'style', // 代码格式（不影响功能）
        'refactor', // 重构（既不是新增功能，也不是修复 bug）
        'perf', // 性能优化
        'test', // 增加测试
        'build', // 构建系统或外部依赖变更
        'ci', // CI 配置
        'chore', // 杂项（不修改 src 或测试）
        'revert', // 回滚
      ],
    ],
    'subject-case': [0],
    'subject-full-stop': [0],
  },
}
