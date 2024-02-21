cmd_Release/fsl.node := ln -f "Release/obj.target/fsl.node" "Release/fsl.node" 2>/dev/null || (rm -rf "Release/fsl.node" && cp -af "Release/obj.target/fsl.node" "Release/fsl.node")
