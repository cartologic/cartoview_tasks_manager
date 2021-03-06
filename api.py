from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie.authorization import Authorization
from tastypie.fields import DictField, ListField
from .models import Task, Project, ProjectDispatchers, ProjectWorkers, Comment, Attachment, History
from tastypie import fields
from django.core.urlresolvers import reverse
from tastypie.utils import trailing_slash
from django.conf.urls import url
from geonode.people.models import Profile
from .customAuth import CustomAuthorization
# User = get_user_model()
from geonode.api.api import ProfileResource
from geonode.maps.models import Map
from tastypie.serializers import Serializer
from tastypie import fields
from cartoview.app_manager.models import App, AppInstance
import json
import os
import shutil
from geonode.api.authorization import GeoNodeAuthorization
import tempfile
from base64 import b64decode, b64encode
from PIL import Image


class UserResource(ProfileResource):
    class Meta(ProfileResource.Meta):
        resource_name = "user"
        authorization = Authorization()


class ProjectResource(ModelResource):
    priority = DictField(attribute='priority', null=True)
    Category = DictField(attribute='Category', null=True)
    logo = DictField(attribute='logo', null=True)
    work_order = DictField(attribute='work_order', null=True)
    due_date = DictField(attribute='due_date', null=True)
    assigned_to = DictField(attribute='assigned_to', null=True)
    Description = DictField(attribute='Description', null=True)
    status = DictField(attribute='status', null=True)
    Project_config = ListField(attribute='Project_config', null=True)
    created_by = fields.ForeignKey(UserResource, 'created_by')
    dispatchers = fields.ManyToManyField(
        UserResource, 'dispatchers', full=True, readonly=True)
    owner = fields.ForeignKey(
        UserResource, 'owner', full=True, null=True, blank=True)

    def hydrate_owner(self, bundle):
	print(bundle.request.user.username if bundle.request.user else "mafe4 user yalaaaaaaaa")
        bundle.data['owner'] = Profile.objects.get(pk=bundle.request.user.pk)

        return bundle

    def dehydrate_owner(self, bundle):
        return bundle.obj.owner.username

    def get_tasks(self, request, **kwargs):
        if request.method == 'DELETE':
            return TaskResource().delete_list(request, project=kwargs['pk'])
        elif request.method == 'GET':
            return TaskResource().get_list(request, project=kwargs['pk'])

    def get_dispatchers(self, request, **kwargs):

        bundle = self.build_bundle(data={'pk': kwargs['pk']}, request=request)
        obj = self.cached_obj_get(
            bundle=bundle, **self.remove_api_resource_names(kwargs))

        child_resource = ProjectDispatchersResource()
        if request.method == 'GET':
            return child_resource.get_list(request, project=obj.pk)
        elif request.method == 'DELETE':
            return child_resource.delete_list(request, project=obj.pk)

    def get_workers(self, request, **kwargs):

        bundle = self.build_bundle(data={'pk': kwargs['pk']}, request=request)
        obj = self.cached_obj_get(
            bundle=bundle, **self.remove_api_resource_names(kwargs))

        child_resource = ProjectWorkersResource()
        if request.method == 'GET':
            return child_resource.get_list(request, project=obj.pk)
        elif request.method == 'DELETE':
            return child_resource.delete_list(request, project=obj.pk)

    def prepend_urls(self):
        return [
            url(r'^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/tasks%s$' % (self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_tasks'),
                name='api_get_tasks_for_project'),
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/dispatchers%s$" % (self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_dispatchers'), name="api_get_project_dispatchers"),
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/workers%s$" % (
                self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_workers'), name="api_get_project_dispatchers"),
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/comments%s$" % (
                self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_comments'), name="api_get_comments")
        ]

    def dehydrate(self, bundle):
	print(bundle.request.user.username if bundle.request.user else "mafe4 user yalaaaaaaaa")
        kwargs = dict(
            api_name='v1', resource_name=self._meta.resource_name, pk=bundle.data['id'])
        bundle.data['tasks_uri'] = reverse(
            'api_get_tasks_for_project', kwargs=kwargs)
        return bundle
    # def dehydrate_priority(self, bundle):
    #     return json.dumps(bundle.obj.priority)

    def dehydrate_user(self, bundle):
        bundle.data['user'] = {'username': bundle.obj.created_by.username}
        return bundle.data['user']

    def hydrate(self, bundle):
        bundle.obj.created_by = Profile.objects.get(
            pk=bundle.request.user.pk)
        if(bundle.data.get('app')):
            app_name = bundle.data['app']
            instance_obj = AppInstance()
            instance_obj.app = App.objects.get(name=app_name)
            bundle.obj.app = instance_obj.app
        if(bundle.data.get('mapid')):
            instance_obj = AppInstance()
            instance_obj.map = Map.objects.get(id=bundle.data.get('mapid'))
            bundle.obj.map = instance_obj.map
        if(bundle.data.get('logo')):
            base64_image = bundle.data.get('logo')
            base64_image = base64_image.get('base64', None)
            format, image = base64_image.split(';base64,')
            image = b64decode(image)
            dirpath = tempfile.mkdtemp()
            original_path = os.path.join(dirpath, 'original.png')
            thumbnail_path = os.path.join(dirpath, 'thumbnail.png')
            with open(original_path, 'wb') as f:
                f.write(image)
            im = Image.open(original_path)
            size = (250, 250)
            im.thumbnail(size)
            im.save(thumbnail_path, "PNG")
            with open(thumbnail_path, "rb") as image_file:
                encoded_image = b64encode(image_file.read())
            shutil.rmtree(dirpath)
            logo = format + ';base64,' + encoded_image
            bundle.obj.logo = {"logo": logo}

        return bundle

    class Meta:
        always_return_data = True

        filtering = {
            'created_by': ALL_WITH_RELATIONS,
            'name': ALL,
            'id': ALL
        }
        queryset = Project.objects.all()
        resource_name = 'project'
        authorization = Authorization()
        # authentication = BasicAuthentication()
        allowed_methods = ['get', 'post', 'put', 'delete']


class TaskResource(ModelResource):
    created_by = fields.ForeignKey(UserResource, 'created_by')
    assigned_to = fields.ForeignKey(
        UserResource, 'assigned_to', full=True, null=True)
    project = fields.ForeignKey(ProjectResource, 'project', full=True)

    def hydrate_created_by(self, bundle):
        bundle.obj.created_by = Profile.objects.get(
            pk=bundle.request.user.pk)
        return bundle

    def dehydrate_created_by(self, bundle):
        bundle.data['created_by'] = {
            'username': bundle.obj.created_by.username}
        return bundle.data['created_by']

    def dehydrate_assigned_to(self, bundle):
        #print("assignto deh",bundle.obj.assigned_to.__dict__)
        if(bundle.obj.assigned_to):
            bundle.data['assigned_to'] = {
                'username': bundle.obj.assigned_to.username, 'id': bundle.obj.assigned_to.id}
        else:
            bundle.data['assigned_to'] = {'username': None}
        return bundle.data['assigned_to']

    def get_comments(self, request, **kwargs):

        bundle = self.build_bundle(data={'pk': kwargs['pk']}, request=request)
        obj = self.cached_obj_get(
            bundle=bundle, **self.remove_api_resource_names(kwargs))

        child_resource = CommentResource()
        return child_resource.get_list(request, task=obj.pk)

    def prepend_urls(self):
        return [
            url(r'^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/tasks%s$' % (self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_tasks'),
                name='api_get_tasks_for_project'),
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/dispatchers%s$" % (self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_dispatchers'), name="api_get_project_dispatchers"),
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/workers%s$" % (
                self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_workers'), name="api_get_project_dispatchers"),
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/comments%s$" % (
                self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_comments'), name="api_get_comments")
        ]

    class Meta:
        always_return_data = True
        filtering = {
            'created_by': ALL_WITH_RELATIONS,
            'assigned_to': ALL_WITH_RELATIONS,
            'project': ["exact", ALL_WITH_RELATIONS],
            'status': ALL,
            'priority': ALL,
            'description': ALL,
            'id': ALL,
            'work_order': ALL,
            'Category': ALL
        }

        queryset = Task.objects.all()
        resource_name = 'task'
        authorization = Authorization()
        # authentication = BasicAuthentication()
        allowed_methods = ['get', 'post', 'put', 'delete']


class ProjectDispatchersResource(ModelResource):
    dispatcher = fields.ForeignKey(UserResource, 'dispatcher', full=True)
    project = fields.ForeignKey(ProjectResource, 'project')

    class Meta:
        filtering = {
            'dispatcher': ALL_WITH_RELATIONS,
            'project': ALL_WITH_RELATIONS,
        }
        queryset = ProjectDispatchers.objects.all()
        resource_name = 'project_dispatchers'
        authorization = Authorization()
        # authentication = BasicAuthentication()
        allowed_methods = ['get', 'post', 'put', 'delete']


class ProjectWorkersResource(ModelResource):
    worker = fields.ForeignKey(UserResource, 'worker', full=True)
    project = fields.ForeignKey(ProjectResource, 'project')

    class Meta:

        filtering = {
            'worker': ALL_WITH_RELATIONS,
            'project': ALL_WITH_RELATIONS,
        }
        queryset = ProjectWorkers.objects.all()
        resource_name = 'project_workers'
        authorization = Authorization()
        # authentication = BasicAuthentication()
        allowed_methods = ['get', 'post', 'put', 'delete']


class CommentResource(ModelResource):
    commenter = fields.ForeignKey(UserResource, 'commenter', full=True)
    task = fields.ForeignKey(TaskResource, 'task')

    def hydrate_commenter(self, bundle):
        bundle.obj.commenter = Profile.objects.get(
            pk=bundle.request.user.pk)
        return bundle

    class Meta:

        filtering = {
            'commenter': ALL_WITH_RELATIONS,
            'task': ALL_WITH_RELATIONS,
        }
        queryset = Comment.objects.all()
        resource_name = 'comment'
        authorization = Authorization()
        # authentication = BasicAuthentication()
        allowed_methods = ['get', 'post', 'put', 'delete']


class HistoryResource(ModelResource):
    task = fields.ForeignKey(TaskResource, 'task')

    class Meta:

        filtering = {
            'task': ALL_WITH_RELATIONS
        }
        queryset = History.objects.all()
        resource_name = 'history'
        authorization = Authorization()
        # authentication = BasicAuthentication()
        allowed_methods = ['get', 'post', 'delete']


class MultipartFormSerializer(Serializer):

    def __init__(self, *args, **kwargs):
        self.content_types['file_upload'] = 'multipart/form-data'
        self.formats.append('file_upload')
        super(MultipartFormSerializer, self).__init__(*args, **kwargs)

    def from_file_upload(self, data, options=None):
        request = options['request']
        deserialized = {}
        for k in request.POST:
            deserialized[str(k)] = str(request.POST[k])
        for k in request.FILES:
            deserialized[str(k)] = request.FILES[k]
        return deserialized

    # add request param to extract files
    def deserialize(self, content, request=None, format='application/json'):
        """
        Given some data and a format, calls the correct method to deserialize
        the data and returns the result.
        """
        desired_format = None

        format = format.split(';')[0]

        for short_format, long_format in self.content_types.items():
            if format == long_format:
                if hasattr(self, "from_%s" % short_format):
                    desired_format = short_format
                    break

        if desired_format is None:
            raise UnsupportedFormat(
                "The format indicated '%s' had no available deserialization\
                 method. Please check your ``formats`` and ``content_types``\
                  on your Serializer." %
                format)

        if isinstance(content,
                      six.binary_type) and desired_format != 'file_upload':
            content = force_text(content)

        deserialized = getattr(self, "from_%s" % desired_format)(content, {
            'request': request
        })
        return deserialized


class MultiResource(object):
    def deserialize(self, request, data, format=None):
        if not format:
            format = request.Meta.get('CONTENT_TYPE', 'application/json')
        if format == 'application/x-www-form-urlencoded':
            return request.POST
        if format.startswith('multipart'):
            data = request.POST.copy()
            print (request.POST)
            data.update(request.FILES)
            return data
        return super(MultiResource, self).deserialize(request, data, format)


class MultiPartResource(MultiResource, ModelResource):
    user = fields.ForeignKey(UserResource, 'user', full=True)
    task = fields.ForeignKey(TaskResource, 'task')

    def hydrate_user(self, bundle):
        print (bundle.data)
        bundle.obj.user = Profile.objects.get(
            pk=bundle.request.user.pk)
        return bundle

    class Meta:

        filtering = {
            'user': ALL_WITH_RELATIONS,
            'task': ALL_WITH_RELATIONS,
        }
        queryset = Attachment.objects.all()
        resource_name = 'attachment'
        authorization = Authorization()
        # authentication = BasicAuthentication()
        allowed_methods = ['get', 'post', 'put', 'delete']
