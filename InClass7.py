import matplotlib.pyplot as plt

x = [1,2,3,4,5]
y = [1,2,3,4,10]

plt.figure()
plt.subplot(121)
plt.plot(x,y, 'go')
plt.xlabel('X',fontsize = 14)
plt.ylabel('Y', fontsize = 14)
plt.title('Scatterplot Greendots', fontsize = 14)

x = [1,2,3,4,5]
y2 = [2,3,4,5,11]

plt.subplot(122)
plt.plot(x,y2, 'b*')
plt.xlabel('X',fontsize = 14)
plt.ylabel('Y', fontsize = 14)
plt.title('Scatterplot Bluestars', fontsize = 14)
plt.show()

