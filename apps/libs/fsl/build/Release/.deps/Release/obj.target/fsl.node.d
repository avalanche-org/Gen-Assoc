cmd_Release/obj.target/fsl.node := g++ -o Release/obj.target/fsl.node -shared -pthread -rdynamic -m64  -Wl,-soname=fsl.node -Wl,--start-group Release/obj.target/fsl/fsl.o -Wl,--end-group 
