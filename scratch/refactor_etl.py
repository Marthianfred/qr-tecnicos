import os

path = '/Users/freddycamops/.paperclip/instances/default/workspaces/98b00abe-0c68-4bbb-875f-4faa6d55fc21/src/ui/components/AdminPanel.tsx'

new_content = ""
current_line = 1
# Basado en el view_file previo que mostró el bloque entre 177 y 186
with open(path, 'r') as f:
    for line in f:
        if current_line >= 177 and current_line <= 186:
            if current_line == 177:
                # Inyectar el nuevo flujo de preview
                new_content += '                         try {\n'
                new_content += '                            setLoading(true);\n'
                new_content += '                            const result = await apiService.previewExcel(file, selectedCountry);\n'
                new_content += '                            setPreviewData(result.preview);\n'
                new_content += '                            setPendingFile(file);\n'
                new_content += '                            e.target.value = "";\n'
                new_content += '                         } catch (err: any) {\n'
                new_content += '                            alert(`❌ Error: ${err.message || "Error en el procesamiento del archivo"}`);\n'
                new_content += '                         } finally {\n'
                new_content += '                            setLoading(false);\n'
                new_content += '                         }\n'
        else:
            new_content += line
        current_line += 1

with open(path, 'w') as f:
    f.write(new_content)

print("ETL FLOW REFACTORED SUCCESSFULLY")
