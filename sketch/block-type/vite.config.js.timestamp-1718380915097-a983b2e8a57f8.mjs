// sketch/block-type/vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///home/nlebrun/Sites/forsaken-ideas/node_modules/vite/dist/node/index.js";
import createExternal from "file:///home/nlebrun/Sites/forsaken-ideas/node_modules/vite-plugin-external/dist/index.mjs";
import { viteStaticCopy } from "file:///home/nlebrun/Sites/forsaken-ideas/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///home/nlebrun/Sites/forsaken-ideas/sketch/block-type/vite.config.js";
var vite_config_default = defineConfig({
  base: "/sketch/block-type/",
  publicDir: "assets/",
  build: {
    rollupOptions: {
      output: {
        format: "iife"
      }
    },
    outDir: "../../public/sketch/block-type/",
    emptyOutDir: true
  },
  plugins: [
    createExternal({
      production: {
        externals: {
          p5: "p5",
          fabric: "fabric"
        }
      }
    }),
    viteStaticCopy({
      targets: [
        { src: "capture.jpg", dest: "" },
        { src: "thumbnail.jpg", dest: "" },
        { src: "assets/**", dest: "assets" }
      ]
    })
  ],
  resolve: {
    alias: {
      "@common": fileURLToPath(
        new URL("../../sketch-common", __vite_injected_original_import_meta_url)
      )
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic2tldGNoL2Jsb2NrLXR5cGUvdml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ubGVicnVuL1NpdGVzL2ZvcnNha2VuLWlkZWFzL3NrZXRjaC9ibG9jay10eXBlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9ubGVicnVuL1NpdGVzL2ZvcnNha2VuLWlkZWFzL3NrZXRjaC9ibG9jay10eXBlL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL25sZWJydW4vU2l0ZXMvZm9yc2FrZW4taWRlYXMvc2tldGNoL2Jsb2NrLXR5cGUvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgY3JlYXRlRXh0ZXJuYWwgZnJvbSAndml0ZS1wbHVnaW4tZXh0ZXJuYWwnXG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5J1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBiYXNlOiAnL3NrZXRjaC9ibG9jay10eXBlLycsXG4gICAgcHVibGljRGlyOiAnYXNzZXRzLycsXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgZm9ybWF0OiAnaWlmZSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb3V0RGlyOiAnLi4vLi4vcHVibGljL3NrZXRjaC9ibG9jay10eXBlLycsXG4gICAgICAgIGVtcHR5T3V0RGlyOiB0cnVlXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIGNyZWF0ZUV4dGVybmFsKHtcbiAgICAgICAgICAgIHByb2R1Y3Rpb246IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgcDU6ICdwNScsXG4gICAgICAgICAgICAgICAgICAgIGZhYnJpYzogJ2ZhYnJpYydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICB2aXRlU3RhdGljQ29weSh7XG4gICAgICAgICAgICB0YXJnZXRzOiBbXG4gICAgICAgICAgICAgICAgeyBzcmM6ICdjYXB0dXJlLmpwZycsIGRlc3Q6ICcnIH0sXG4gICAgICAgICAgICAgICAgeyBzcmM6ICd0aHVtYm5haWwuanBnJywgZGVzdDogJycgfSxcbiAgICAgICAgICAgICAgICB7IHNyYzogJ2Fzc2V0cy8qKicsIGRlc3Q6ICdhc3NldHMnIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSlcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgICdAY29tbW9uJzogZmlsZVVSTFRvUGF0aChcbiAgICAgICAgICAgICAgICBuZXcgVVJMKCcuLi8uLi9za2V0Y2gtY29tbW9uJywgaW1wb3J0Lm1ldGEudXJsKVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFUsU0FBUyxlQUFlLFdBQVc7QUFDalgsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxvQkFBb0I7QUFDM0IsU0FBUyxzQkFBc0I7QUFIaUwsSUFBTSwyQ0FBMkM7QUFNalEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsTUFBTTtBQUFBLEVBQ04sV0FBVztBQUFBLEVBQ1gsT0FBTztBQUFBLElBQ0gsZUFBZTtBQUFBLE1BQ1gsUUFBUTtBQUFBLFFBQ0osUUFBUTtBQUFBLE1BQ1o7QUFBQSxJQUNKO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDakI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNYLFlBQVk7QUFBQSxRQUNSLFdBQVc7QUFBQSxVQUNQLElBQUk7QUFBQSxVQUNKLFFBQVE7QUFBQSxRQUNaO0FBQUEsTUFDSjtBQUFBLElBQ0osQ0FBQztBQUFBLElBQ0QsZUFBZTtBQUFBLE1BQ1gsU0FBUztBQUFBLFFBQ0wsRUFBRSxLQUFLLGVBQWUsTUFBTSxHQUFHO0FBQUEsUUFDL0IsRUFBRSxLQUFLLGlCQUFpQixNQUFNLEdBQUc7QUFBQSxRQUNqQyxFQUFFLEtBQUssYUFBYSxNQUFNLFNBQVM7QUFBQSxNQUN2QztBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILFdBQVc7QUFBQSxRQUNQLElBQUksSUFBSSx1QkFBdUIsd0NBQWU7QUFBQSxNQUNsRDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
