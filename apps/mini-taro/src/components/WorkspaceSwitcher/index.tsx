import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { useWorkspaceStore } from '@/stores/workspace-store'
import './index.scss'

export function WorkspaceSwitcher() {
  const { data = [] } = useWorkspaces()
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const setActiveWorkspaceId = useWorkspaceStore((s) => s.setActiveWorkspaceId)

  const active = data.find((item) => item.id === activeWorkspaceId) || data[0]

  const handleSwitch = async () => {
    if (data.length === 0) return
    try {
      const res = await Taro.showActionSheet({
        itemList: data.map((item) => `${item.name}（${item.role}）`),
      })
      const target = data[res.tapIndex]
      if (target) setActiveWorkspaceId(target.id)
    } catch {
      // 用户取消
    }
  }

  return (
    <View className="workspace-switcher" onClick={handleSwitch}>
      <Text className="workspace-switcher__label">📚</Text>
      <Text className="workspace-switcher__name">{active?.name || '选择书架'}</Text>
      <Text className="workspace-switcher__arrow">▼</Text>
    </View>
  )
}
