import matplotlib.pyplot as plt
import numpy as np

#x= [1,1,2,3,3,5,7,8,9,10,

#10,11,11,13,13,15,16,17,18,18,

#18,19,20,21,21,23,24,24,25,25,

#25,25,26,26,26,27,27,27,27,27,

#29,30,30,31,33,34,34,34,35,36,

#36,37,37,38,38,39,40,41,41,42,

#3,44,45,45,46,47,48,48,49,50,

#51,52,53,54,55,55,56,57,58,60,

#61,63,64,65,66,68,70,71,72,74,

#75,77,81,83,84,87,89,90,90,91
#]

#plt.figure()
#plt.hist(x, bins=10)
#plt.title('histogram',fontsize=14)
#plt.xlabel('Number', fontsize=14)
#plt.ylabel('Probability', fontsize=14)
#plt.show()

def f(t):
    return np.exp(-t) * np.cos(2*np.pi*t)

t1 = np.arange(0.0, 5.0, 0.1)
t2 = np.arange(0.0, 5.0, 0.02)

plt.figure()
plt.subplot(211)
plt.plot(t1, f(t))
