const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🔧 Reparando Server Actions y limpiando cache...")

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true })
    console.log(`✅ Eliminado: ${dirPath}`)
  } else {
    console.log(`ℹ️  No existe: ${dirPath}`)
  }
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`✅ Eliminado: ${filePath}`)
  } else {
    console.log(`ℹ️  No existe: ${filePath}`)
  }
}

try {
  console.log("\n🧹 Paso 1: Limpiando cache de Next.js...")
  removeDir(".next")
  removeDir(".vercel")
  removeDir("node_modules/.cache")

  console.log("\n📄 Paso 2: Eliminando lockfiles...")
  removeFile("pnpm-lock.yaml")
  removeFile("package-lock.json")
  removeFile("yarn.lock")

  console.log("\n📁 Paso 3: Eliminando node_modules...")
  removeDir("node_modules")

  console.log("\n🧹 Paso 4: Limpiando cache de pnpm...")
  try {
    execSync("pnpm store prune", { stdio: "inherit" })
    console.log("✅ Cache de pnpm limpiado")
  } catch (error) {
    console.log("⚠️ No se pudo limpiar el store de pnpm:", error.message)
  }

  console.log("\n📦 Paso 5: Reinstalando dependencias...")
  execSync("pnpm install --no-frozen-lockfile", { stdio: "inherit" })

  console.log("\n🔍 Paso 6: Verificando archivos...")
  if (fs.existsSync("pnpm-lock.yaml")) {
    console.log("✅ pnpm-lock.yaml creado")
  }
  if (fs.existsSync("node_modules")) {
    console.log("✅ node_modules creado")
  }

  console.log("\n🎉 ¡Reparación completada!")
  console.log("\n📝 Próximos pasos:")
  console.log("1. git add .")
  console.log('2. git commit -m "fix: resolve server actions and update lockfile"')
  console.log("3. git push")
  console.log("\n💡 Esto debería resolver el error de Server Action.")
} catch (error) {
  console.error("\n❌ Error durante la reparación:", error.message)
  console.log("\n🔄 Intentando solución alternativa...")

  try {
    console.log("Limpiando solo cache...")
    removeDir(".next")
    removeDir(".vercel")

    console.log("Reinstalando sin cache...")
    execSync("pnpm install --force", { stdio: "inherit" })

    console.log("✅ Solución alternativa aplicada")
  } catch (altError) {
    console.error("❌ Error en solución alternativa:", altError.message)
    process.exit(1)
  }
}
