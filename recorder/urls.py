from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^api/roast$', views.roast_api, name='roast_api'),
    url(r'^api/all_roasts$', views.all_roasts_api, name='all_roast_api'),
    url(r'^api/delete_roast$', views.delete_roast_api, name='delete_roast_api'),
    url(r'^api/create_roast$', views.create_roast_api, name='create_roast_api'),
    url(r'^api/create_datapoint$', views.create_datapoint_api, name='create_datapoint_api'),
]
