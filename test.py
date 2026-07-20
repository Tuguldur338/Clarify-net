rainfall = []
for i in range(1, 365):
    rainfall.append(float(input("Enter the rainfall for day " + str(i) + ": ")))
total_rainfall = sum(rainfall)
average_rainfall = total_rainfall / len(rainfall)
print("Total rainfall for the year: " + str(total_rainfall))
print("Average daily rainfall: " + str(average_rainfall))