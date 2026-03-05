import { fileURLToPath } from 'url'
import pkg from './package.json'
import dayjs from 'dayjs'
import { defineConfig, ConfigEnv, loadEnv } from 'vite'
import { wrapperEnv } from './config/utils'
import { createVitePlugins } from './config/vite/plugin'
import { createProxy } from './config/vite/proxy'
import { createBuild } from './config/vite/build'

const { dependencies, devDependencies, name, version } = pkg
// 应用信息
const __APP_INFO__ = {
	pkg: { dependencies, devDependencies, name, version },
	lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
}
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv) => {
	// console.log('command', command)
	const root = process.cwd() // 当前工作目录
	const isBuild = command === 'build' // 是否是构建 serve
	const env = loadEnv(mode, root) // 加载env环境
	// The boolean type read by loadEnv is a string. This function can be converted to boolean type
	const viteEnv = wrapperEnv(env)

	const { VITE_PUBLIC_PATH, VITE_OUTPUT_DIR } = viteEnv
	return {
		root: root,
		base: VITE_PUBLIC_PATH,
		plugins: [createVitePlugins(viteEnv, isBuild)],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
			}
		},
		css: {
			preprocessorOptions: {
				scss: {
					charset: false, // 避免出现: build时的 @charset 必须在第一行的警告
					additionalData: `
						@use "@/styles/mixin.scss" as *;
						@use "@/styles/variables.scss" as *;
					`
				}
			}
		},
		server: {
			host: true,
			proxy: createProxy(viteEnv)
		},
		build: <any>createBuild(viteEnv),
		define: {
			__APP_INFO__: JSON.stringify(__APP_INFO__)
		}
	}
})
