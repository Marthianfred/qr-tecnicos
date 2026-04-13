import os

path = '/Users/freddycamops/.paperclip/instances/default/workspaces/98b00abe-0c68-4bbb-875f-4faa6d55fc21/src/ui/components/AdminPanel.tsx'

with open(path, 'r') as f:
    lines = f.readlines()

new_lines = []
target_pattern = 'className={}'
# The correct template literal string
correct_class = "className={`text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-widest transition-all ${p.activo ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}"

for line in lines:
    if target_pattern in line:
        indent = line[:line.find(target_pattern)]
        new_lines.append(f"{indent}{correct_class}\n")
    else:
        new_lines.append(line)

with open(path, 'w') as f:
    f.writelines(new_lines)

print("STYLES RESTORED SUCCESSFULLY")
