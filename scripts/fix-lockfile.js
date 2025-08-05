const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🔧 Iniciando reparación del lockfile...")

// Función para eliminar directorio recursivamente
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true })
    console.log(`✅ Eliminado: ${dirPath}`)
  } else {
    console.log(`ℹ️  No existe: ${dirPath}`)
  }
}

// Función para eliminar archivo
function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`✅ Eliminado: ${filePath}`)
  } else {
    console.log(`ℹ️  No existe: ${filePath}`)
  }
}

try {
  // Paso 1: Eliminar node_modules
  console.log("\n📁 Paso 1: Eliminando node_modules...")
  removeDir("node_modules")

  // Paso 2: Eliminar archivos de cache y lock
  console.log("\n📄 Paso 2: Eliminando archivos de cache...")
  removeFile("pnpm-lock.yaml")
  removeFile("package-lock.json")
  removeFile("yarn.lock")
  removeDir(".next")
  removeDir(".vercel")

  // Paso 3: Limpiar cache de pnpm
  console.log("\n🧹 Paso 3: Limpiando cache de pnpm...")
  try {
    execSync("pnpm store prune", { stdio: "inherit" })
  } catch (error) {
    console.log("⚠️ No se pudo limpiar el store de pnpm:", error.message)
  }

  // Paso 4: Ejecutar pnpm install
  console.log("\n📦 Paso 4: Ejecutando pnpm install...")
  execSync("pnpm install", { stdio: "inherit" })

  // Paso 5: Verificar que se creó el lockfile
  console.log("\n🔍 Paso 5: Verificando archivos...")
  if (fs.existsSync("pnpm-lock.yaml")) {
    console.log("✅ pnpm-lock.yaml creado correctamente")
  } else {
    console.log("❌ Error: pnpm-lock.yaml no se creó")
    process.exit(1)
  }

  if (fs.existsSync("node_modules")) {
    console.log("✅ node_modules creado correctamente")
  } else {
    console.log("❌ Error: node_modules no se creó")
    process.exit(1)
  }

  console.log("\n🎉 ¡Reparación completada exitosamente!")
  console.log("\n📝 Próximos pasos:")
  console.log("1. git add pnpm-lock.yaml")
  console.log('2. git commit -m "fix: update lockfile and clear cache"')
  console.log("3. git push")
  console.log("\n💡 Esto debería resolver el error de Server Action también.")
} catch (error) {
  console.error("\n❌ Error durante la reparación:", error.message)
  process.exit(1)
}
