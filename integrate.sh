#!/bin/bash

echo "Integrando archivos nuevos a quik-fix sin sobrescribir existentes..."

# Función para copiar solo si el archivo no existe
copy_if_not_exists() {
    src=$1
    dest=$2
    if [ ! -f "$dest" ]; then
        cp "$src" "$dest"
        echo "Copiado: $dest"
    else
        echo "Omitido (ya existe): $dest"
    fi
}

# Integrar context
for file in temp_integration/context/*; do
    copy_if_not_exists "$file" "./context/$(basename $file)"
done

# Integrar components
for file in temp_integration/components/*; do
    copy_if_not_exists "$file" "./components/$(basename $file)"
done

# Integrar screens
for file in temp_integration/screens/*; do
    copy_if_not_exists "$file" "./screens/$(basename $file)"
done

echo "Integración completada. Revisa la carpeta screens, components y context."
